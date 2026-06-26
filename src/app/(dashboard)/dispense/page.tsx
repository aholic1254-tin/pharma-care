import { getDrugs } from "@/lib/supabase/medicines";
import { DispenseForm } from "@/components/dispense/dispense-form";

export default async function DispensePage() {
  const drugs = await getDrugs();
  return <DispenseForm drugs={drugs} />;
}
