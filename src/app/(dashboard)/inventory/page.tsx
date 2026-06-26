import { Suspense } from "react";
import { getDrugInventory } from "@/lib/supabase/inventory";
import { InventoryGrid } from "@/components/inventory/inventory-grid";
import { DrugCardSkeleton } from "@/components/inventory/drug-card";

async function InventoryContent() {
  const drugs = await getDrugInventory();
  return <InventoryGrid drugs={drugs} />;
}

function InventorySkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="h-9 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-9 w-40 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <DrugCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryContent />
    </Suspense>
  );
}
