export const dynamic = "force-dynamic";

import { getDrugs } from "@/lib/supabase/medicines";
import { getSuppliers, getPackageTypes } from "@/lib/supabase/receive";
import { ReceiveForm } from "@/components/receive/receive-form";

export default async function ReceivePage({
  searchParams,
}: {
  searchParams: Promise<{ drug_id?: string }>;
}) {
  const params = await searchParams;
  const initialDrugId = params.drug_id ? Number(params.drug_id) : 0;

  const [drugs, suppliers, packageTypes] = await Promise.all([
    getDrugs(),
    getSuppliers(),
    getPackageTypes(),
  ]);

  return (
    <ReceiveForm
      drugs={drugs}
      initialSuppliers={suppliers}
      initialPackageTypes={packageTypes}
      initialDrugId={initialDrugId}
    />
  );
}
