import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type DrugWithForm = Database["public"]["Tables"]["drugs"]["Row"] & {
  drug_forms: Database["public"]["Tables"]["drug_forms"]["Row"];
};

export async function getDrugs(): Promise<DrugWithForm[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drugs")
    .select("*, drug_forms(id, name, sort_order)")
    .order("drug_id", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DrugWithForm[];
}

export async function getDrugForms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drug_forms")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
