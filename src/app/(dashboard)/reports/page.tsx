export const dynamic = "force-dynamic";

import {
  getInventoryReport, getExpiryReport,
  getMonthlyReceive, getMonthlyDispense,
} from "@/lib/supabase/reports";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const currentYear = new Date().getFullYear();

  const [inventory, expiry, monthlyReceive, monthlyDispense] = await Promise.all([
    getInventoryReport(),
    getExpiryReport(),
    getMonthlyReceive(currentYear),
    getMonthlyDispense(currentYear),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Inventory summaries, expiry tracking, and monthly trends.
        </p>
      </div>
      <ReportsClient
        inventory={inventory}
        expiry={expiry}
        monthlyReceive={monthlyReceive}
        monthlyDispense={monthlyDispense}
        currentYear={currentYear}
      />
    </div>
  );
}
