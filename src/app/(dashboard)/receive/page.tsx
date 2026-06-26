import { getDrugs } from "@/lib/supabase/medicines";
import { getSuppliers, getPackageTypes } from "@/lib/supabase/receive";
import { ReceiveForm } from "@/components/receive/receive-form";

export default async function ReceivePage() {
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
    />
  );
}
