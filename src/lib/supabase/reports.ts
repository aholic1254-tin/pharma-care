import { createClient } from "@/lib/supabase/server";

export interface InventoryReportRow {
  drug_id: string;
  name: string;
  form: string;
  unit: string;
  minimum_stock: number;
  total_quantity: number;
  total_value: number;
  lot_count: number;
}

export interface ExpiryReportRow {
  lot_code: string;
  drug_id: string;
  drug_name: string;
  expiry_date: string;
  remaining_quantity: number;
  unit_price: number;
  value: number;
  supplier: string | null;
}

export interface MonthlyRow {
  month: string; // "YYYY-MM"
  total_quantity: number;
  total_value: number;
  transaction_count: number;
}

export async function getInventoryReport(): Promise<InventoryReportRow[]> {
  const supabase = await createClient();

  const { data: drugs } = await supabase
    .from("drugs")
    .select("id, drug_id, name, unit, minimum_stock, drug_forms(name)")
    .order("drug_id");

  const { data: lotsRaw } = await supabase
    .from("lots")
    .select("drug_id, remaining_quantity, unit_price")
    .gt("remaining_quantity", 0);

  const lots = (lotsRaw ?? []) as unknown as {
    drug_id: number; remaining_quantity: number; unit_price: number;
  }[];

  const map: Record<number, { qty: number; value: number; count: number }> = {};
  for (const l of lots) {
    if (!map[l.drug_id]) map[l.drug_id] = { qty: 0, value: 0, count: 0 };
    map[l.drug_id].qty += l.remaining_quantity;
    map[l.drug_id].value += l.remaining_quantity * Number(l.unit_price);
    map[l.drug_id].count += 1;
  }

  return ((drugs ?? []) as unknown as {
    id: number; drug_id: string; name: string; unit: string;
    minimum_stock: number; drug_forms: { name: string } | null;
  }[]).map((d) => ({
    drug_id: d.drug_id,
    name: d.name,
    form: d.drug_forms?.name ?? "—",
    unit: d.unit,
    minimum_stock: d.minimum_stock,
    total_quantity: map[d.id]?.qty ?? 0,
    total_value: map[d.id]?.value ?? 0,
    lot_count: map[d.id]?.count ?? 0,
  }));
}

export async function getExpiryReport(): Promise<ExpiryReportRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lots")
    .select("lot_code, expiry_date, remaining_quantity, unit_price, drug_id, drugs(drug_id, name), suppliers(name)")
    .gt("remaining_quantity", 0)
    .order("expiry_date", { ascending: true });

  return ((data ?? []) as unknown as {
    lot_code: string; expiry_date: string; remaining_quantity: number;
    unit_price: number; drugs: { drug_id: string; name: string } | null;
    suppliers: { name: string } | null;
  }[]).map((r) => ({
    lot_code: r.lot_code,
    drug_id: r.drugs?.drug_id ?? "—",
    drug_name: r.drugs?.name ?? "—",
    expiry_date: r.expiry_date,
    remaining_quantity: r.remaining_quantity,
    unit_price: Number(r.unit_price),
    value: r.remaining_quantity * Number(r.unit_price),
    supplier: r.suppliers?.name ?? null,
  }));
}

export async function getMonthlyReceive(year: number): Promise<MonthlyRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receive_transactions")
    .select("receive_date, quantity, unit_price")
    .gte("receive_date", `${year}-01-01`)
    .lte("receive_date", `${year}-12-31`);

  const map: Record<string, MonthlyRow> = {};
  for (const r of (data ?? []) as unknown as { receive_date: string; quantity: number; unit_price: number }[]) {
    const month = r.receive_date.slice(0, 7);
    if (!map[month]) map[month] = { month, total_quantity: 0, total_value: 0, transaction_count: 0 };
    map[month].total_quantity += r.quantity;
    map[month].total_value += r.quantity * Number(r.unit_price);
    map[month].transaction_count += 1;
  }
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

export async function getMonthlyDispense(year: number): Promise<MonthlyRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dispense_transactions")
    .select("dispense_date, quantity, lots(unit_price)")
    .gte("dispense_date", `${year}-01-01`)
    .lte("dispense_date", `${year}-12-31`);

  const map: Record<string, MonthlyRow> = {};
  for (const r of (data ?? []) as unknown as { dispense_date: string; quantity: number; lots: { unit_price: number } | null }[]) {
    const month = r.dispense_date.slice(0, 7);
    if (!map[month]) map[month] = { month, total_quantity: 0, total_value: 0, transaction_count: 0 };
    map[month].total_quantity += r.quantity;
    map[month].total_value += r.quantity * Number(r.lots?.unit_price ?? 0);
    map[month].transaction_count += 1;
  }
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}
