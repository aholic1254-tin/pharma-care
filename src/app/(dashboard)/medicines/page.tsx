import { Suspense } from "react";
import { getDrugs, getDrugForms } from "@/lib/supabase/medicines";
import { MedicineTable } from "@/components/medicines/medicine-table";
import { Skeleton } from "@/components/ui/skeleton";

async function MedicineContent() {
  const [drugs, drugForms] = await Promise.all([getDrugs(), getDrugForms()]);
  return <MedicineTable initialDrugs={drugs} drugForms={drugForms} />;
}

function MedicineTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-muted/30 p-3 flex gap-4">
          {[90, 200, 110, 80, 90].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-3 border-t border-border flex gap-4 items-center">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MedicinesPage() {
  return (
    <Suspense fallback={<MedicineTableSkeleton />}>
      <MedicineContent />
    </Suspense>
  );
}
