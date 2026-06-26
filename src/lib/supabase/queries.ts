import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type LotRow = Database["public"]["Tables"]["lots"]["Row"];
type DrugRow = Database["public"]["Tables"]["drugs"]["Row"];

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = await createClient();

  const [drugsRes, lotsRes, expiringRes] = await Promise.all([
    supabase.from("drugs").select("id, minimum_stock", { count: "exact" }),
    supabase
      .from("lots")
      .select("remaining_quantity, unit_price")
      .gt("remaining_quantity", 0),
    supabase
      .from("lots")
      .select("id")
      .gt("remaining_quantity", 0)
      .lte(
        "expiry_date",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      ),
  ]);

  const totalMedicines = drugsRes.count ?? 0;

  const lots = (lotsRes.data ?? []) as Pick<
    LotRow,
    "remaining_quantity" | "unit_price"
  >[];
  const totalQuantity = lots.reduce((s, l) => s + l.remaining_quantity, 0);
  const inventoryValue = lots.reduce(
    (s, l) => s + l.remaining_quantity * Number(l.unit_price),
    0
  );
  const expiringWithin30Days = expiringRes.data?.length ?? 0;

  // Low stock: drug's total remaining <= minimum_stock
  const drugs = (drugsRes.data ?? []) as Pick<DrugRow, "id" | "minimum_stock">[];
  const drugIds = drugs.map((d) => d.id);
  let lowStockCount = 0;

  if (drugIds.length > 0) {
    const { data: stockData } = await supabase
      .from("lots")
      .select("drug_id, remaining_quantity")
      .in("drug_id", drugIds);

    const stockRows = (stockData ?? []) as Pick<
      LotRow,
      "drug_id" | "remaining_quantity"
    >[];
    const stockByDrug: Record<number, number> = {};
    for (const row of stockRows) {
      stockByDrug[row.drug_id] =
        (stockByDrug[row.drug_id] ?? 0) + row.remaining_quantity;
    }
    for (const drug of drugs) {
      if ((stockByDrug[drug.id] ?? 0) <= drug.minimum_stock) {
        lowStockCount++;
      }
    }
  }

  return {
    totalMedicines,
    totalQuantity,
    inventoryValue,
    expiringWithin30Days,
    lowStockCount,
  };
}

// ─── Recent Transactions ──────────────────────────────────────────────────────

export type RecentReceiveRow = {
  id: number;
  receive_date: string;
  quantity: number;
  lot_code: string;
  drugs: { drug_id: string; name: string } | null;
  suppliers: { name: string } | null;
};

export type RecentDispenseRow = {
  id: number;
  dispense_date: string;
  quantity: number;
  patient_name: string | null;
  drugs: { drug_id: string; name: string } | null;
  lots: { lot_code: string } | null;
};

export async function getRecentReceive(limit = 8): Promise<RecentReceiveRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receive_transactions")
    .select(
      "id, receive_date, quantity, lot_code, drugs(drug_id, name), suppliers(name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as RecentReceiveRow[];
}

export async function getRecentDispense(
  limit = 8
): Promise<RecentDispenseRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dispense_transactions")
    .select(
      "id, dispense_date, quantity, patient_name, drugs(drug_id, name), lots(lot_code)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as RecentDispenseRow[];
}
