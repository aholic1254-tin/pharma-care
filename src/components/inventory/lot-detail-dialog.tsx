"use client";

import { formatDate, formatCurrency, formatNumber } from "@/lib/utils";
import { getExpiryStatus, EXPIRY_STATUS_COLORS } from "@/types/index";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { DrugInventory, LotDetail } from "@/lib/supabase/inventory";

interface Props {
  drug: DrugInventory | null;
  lots: LotDetail[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LotDetailDialog({ drug, lots, open, onOpenChange }: Props) {
  if (!drug) return null;

  const totalQty = lots.reduce((s, l) => s + l.remaining_quantity, 0);
  const totalValue = lots.reduce((s, l) => s + l.remaining_quantity * Number(l.unit_price), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          {/* Drug header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{drug.drug_id}</span>
              <Badge variant="secondary">{drug.drug_forms?.name ?? "—"}</Badge>
            </div>
            <DialogTitle className="text-lg">{drug.name}</DialogTitle>
            <div className="flex gap-6 text-sm pt-1">
              <div>
                <span className="text-muted-foreground">Total Stock: </span>
                <span className="font-semibold">{formatNumber(totalQty)} {drug.unit}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Value: </span>
                <span className="font-semibold">฿{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* LOT table */}
        {lots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No stock on hand.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  {["LOT Code", "Receive Date", "Expiry Date", "Qty", "Unit Price", "Value", "Supplier", "Package"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => {
                  const status = getExpiryStatus(lot.expiry_date);
                  const value = lot.remaining_quantity * Number(lot.unit_price);
                  return (
                    <tr key={lot.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                      <td className="py-2 px-3 font-mono text-xs font-medium">{lot.lot_code}</td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(lot.receive_date)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", EXPIRY_STATUS_COLORS[status])}>
                          {formatDate(lot.expiry_date)}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-right">
                        {formatNumber(lot.remaining_quantity)}
                      </td>
                      <td className="py-2 px-3 text-right text-muted-foreground">
                        ฿{formatCurrency(Number(lot.unit_price))}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        ฿{formatCurrency(value)}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {lot.suppliers?.name ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {lot.package_types?.name ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/20 border-t-2 border-border">
                  <td colSpan={3} className="py-2 px-3 text-xs font-semibold">Total</td>
                  <td className="py-2 px-3 text-right font-bold">{formatNumber(totalQty)}</td>
                  <td />
                  <td className="py-2 px-3 text-right font-bold">฿{formatCurrency(totalValue)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
