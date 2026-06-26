export const dynamic = "force-dynamic";

import { getReceiveHistory, getDispenseHistory } from "@/lib/supabase/history";
import { HistoryClient } from "@/components/history/history-client";

export default async function HistoryPage() {
  const [receiveRows, dispenseRows] = await Promise.all([
    getReceiveHistory(500),
    getDispenseHistory(500),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse and export receive &amp; dispense records.
        </p>
      </div>
      <HistoryClient receiveRows={receiveRows} dispenseRows={dispenseRows} />
    </div>
  );
}
