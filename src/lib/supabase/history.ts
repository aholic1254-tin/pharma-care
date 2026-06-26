import { createClient } from "@/lib/supabase/server";

export interface ReceiveHistoryRow {
  id: number;
  receive_date: string;
  lot_code: string;
  quantity: number;
  expiry_date: string;
  unit_price: number;
  note: string | null;
  created_at: string;
  drugs: { drug_id: string; name: string } | null;
  suppliers: { name: string } | null;
  package_types: { name: string } | null;
}

export interface DispenseHistoryRow {
  id: number;
  dispense_date: string;
  quantity: number;
  patient_name: string | null;
  note: string | null;
  created_at: string;
  drugs: { drug_id: string; name: string } | null;
  lots: { lot_code: string; expiry_date: string } | null;
}

export async function getReceiveHistory(limit = 500): Promise<ReceiveHistoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receive_transactions")
    .select("id, receive_date, lot_code, quantity, expiry_date, unit_price, note, created_at, drugs(drug_id, name), suppliers(name), package_types(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ReceiveHistoryRow[];
}

export async function getDispenseHistory(limit = 500): Promise<DispenseHistoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dispense_transactions")
    .select("id, dispense_date, quantity, patient_name, note, created_at, drugs(drug_id, name), lots(lot_code, expiry_date)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as DispenseHistoryRow[];
}
