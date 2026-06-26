export const dynamic = "force-dynamic";

import { getDrugs } from "@/lib/supabase/medicines";
import { DispenseForm } from "@/components/dispense/dispense-form";

export default async function DispensePage({
  searchParams,
}: {
  searchParams: Promise<{ drug_id?: string }>;
}) {
  const params = await searchParams;
  const initialDrugId = params.drug_id ? Number(params.drug_id) : 0;

  const drugs = await getDrugs();
  return <DispenseForm drugs={drugs} initialDrugId={initialDrugId} />;
}
