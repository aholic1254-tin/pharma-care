import { createClient } from "@/lib/supabase/server";

export interface BarcodeMatch {
  drug_id: number;
  drug_code: string;
  name: string;
  unit: string;
  drug_forms: { name: string } | null;
}

export async function lookupBarcode(barcode: string): Promise<BarcodeMatch | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("drug_barcodes")
    .select("drug_id, drugs(id, drug_id, name, unit, drug_forms(name))")
    .eq("barcode", barcode)
    .maybeSingle();

  if (!data) return null;

  const d = (data as unknown as {
    drug_id: number;
    drugs: { id: number; drug_id: string; name: string; unit: string; drug_forms: { name: string } | null } | null;
  });

  if (!d.drugs) return null;
  return {
    drug_id: d.drugs.id,
    drug_code: d.drugs.drug_id,
    name: d.drugs.name,
    unit: d.drugs.unit,
    drug_forms: d.drugs.drug_forms,
  };
}
