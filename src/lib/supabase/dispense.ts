import { createClient } from "@/lib/supabase/server";

export interface LotForDispense {
  id: number;
  lot_code: string;
  expiry_date: string;
  remaining_quantity: number;
  unit_price: number;
  supplier_id: number | null;
  package_type_id: number | null;
  suppliers: { name: string } | null;
  package_types: { name: string } | null;
}

export async function getLotsForDrug(drugId: number): Promise<LotForDispense[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lots")
    .select("id, lot_code, expiry_date, remaining_quantity, unit_price, supplier_id, package_type_id, suppliers(name), package_types(name)")
    .eq("drug_id", drugId)
    .gt("remaining_quantity", 0)
    .order("expiry_date", { ascending: true });
  return (data ?? []) as unknown as LotForDispense[];
}
