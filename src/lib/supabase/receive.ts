import { createClient } from "@/lib/supabase/server";

export async function getSuppliers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name");
  return data ?? [];
}

export async function getPackageTypes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("package_types")
    .select("id, name")
    .order("name");
  return data ?? [];
}
