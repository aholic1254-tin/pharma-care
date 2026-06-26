import { createClient } from "@/lib/supabase/server";

export interface DrugInventory {
  id: number;
  drug_id: string;
  name: string;
  unit: string;
  minimum_stock: number;
  image_url: string | null;
  drug_forms: { name: string } | null;
  totalQuantity: number;
  totalValue: number;
}

export interface LotDetail {
  id: number;
  lot_code: string;
  receive_date: string;
  expiry_date: string;
  remaining_quantity: number;
  unit_price: number;
  suppliers: { name: string } | null;
  package_types: { name: string } | null;
}

export async function getDrugInventory(): Promise<DrugInventory[]> {
  const supabase = await createClient();

  const { data: drugs } = await supabase
    .from("drugs")
    .select("id, drug_id, name, unit, minimum_stock, image_url, drug_forms(name)")
    .order("drug_id");

  if (!drugs || drugs.length === 0) return [];

  const { data: lotsRaw } = await supabase
    .from("lots")
    .select("drug_id, remaining_quantity, unit_price")
    .gt("remaining_quantity", 0);

  const lots = (lotsRaw ?? []) as unknown as {
    drug_id: number;
    remaining_quantity: number;
    unit_price: number;
  }[];

  const stockMap: Record<number, { qty: number; value: number }> = {};
  for (const lot of lots) {
    if (!stockMap[lot.drug_id]) stockMap[lot.drug_id] = { qty: 0, value: 0 };
    stockMap[lot.drug_id].qty += lot.remaining_quantity;
    stockMap[lot.drug_id].value += lot.remaining_quantity * Number(lot.unit_price);
  }

  return (drugs as unknown as Omit<DrugInventory, "totalQuantity" | "totalValue">[]).map((d) => ({
    ...d,
    totalQuantity: stockMap[d.id]?.qty ?? 0,
    totalValue: stockMap[d.id]?.value ?? 0,
  }));
}

export async function getLotsForDetail(drugId: number): Promise<LotDetail[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lots")
    .select("id, lot_code, receive_date, expiry_date, remaining_quantity, unit_price, suppliers(name), package_types(name)")
    .eq("drug_id", drugId)
    .order("expiry_date", { ascending: true });
  return (data ?? []) as unknown as LotDetail[];
}
