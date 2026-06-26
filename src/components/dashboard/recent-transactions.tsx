import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { RecentReceiveRow as ReceiveRow, RecentDispenseRow as DispenseRow } from "@/lib/supabase/queries";

// ─── Recent Receive ───────────────────────────────────────────

export function RecentReceiveTable({ rows }: { rows: ReceiveRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No receive transactions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              Date
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              Medicine
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              LOT
            </th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
              Qty
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              Supplier
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/50 hover:bg-muted/40 transition-colors"
            >
              <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                {formatDate(row.receive_date)}
              </td>
              <td className="py-2 px-3">
                <div className="font-medium truncate max-w-[180px]">
                  {row.drugs?.name ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.drugs?.drug_id ?? ""}
                </div>
              </td>
              <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                {row.lot_code}
              </td>
              <td className="py-2 px-3 text-right font-medium">{row.quantity}</td>
              <td className="py-2 px-3 text-muted-foreground truncate max-w-[120px]">
                {row.suppliers?.name ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Recent Dispense ──────────────────────────────────────────

export function RecentDispenseTable({ rows }: { rows: DispenseRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No dispense transactions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              Date
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              Medicine
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              LOT
            </th>
            <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
              Qty
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
              Patient
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/50 hover:bg-muted/40 transition-colors"
            >
              <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                {formatDate(row.dispense_date)}
              </td>
              <td className="py-2 px-3">
                <div className="font-medium truncate max-w-[180px]">
                  {row.drugs?.name ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.drugs?.drug_id ?? ""}
                </div>
              </td>
              <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                {row.lots?.lot_code ?? "—"}
              </td>
              <td className="py-2 px-3 text-right font-medium">{row.quantity}</td>
              <td className="py-2 px-3 text-muted-foreground truncate max-w-[120px]">
                {row.patient_name ? (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {row.patient_name}
                  </Badge>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────

export function TransactionTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 py-2 px-3">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 flex-1 bg-muted animate-pulse rounded" />
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
