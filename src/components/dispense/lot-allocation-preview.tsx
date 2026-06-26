"use client";

import { formatDate, formatCurrency } from "@/lib/utils";
import { getExpiryStatus, EXPIRY_STATUS_COLORS } from "@/types/index";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { LotAllocation } from "@/lib/validations/dispense";

interface Props {
  allocations: LotAllocation[];
  onChange: (allocations: LotAllocation[]) => void;
  totalRequested: number;
}

export function LotAllocationPreview({ allocations, onChange, totalRequested }: Props) {
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  const isValid = totalAllocated === totalRequested;

  function handleQtyChange(index: number, value: number) {
    const updated = allocations.map((a, i) =>
      i === index ? { ...a, allocated: Math.max(0, Math.min(value, a.available)) } : a
    );
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">LOT Code</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Expiry</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Available</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Dispense</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Value</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, i) => {
              const status = getExpiryStatus(a.expiry_date);
              return (
                <tr key={a.lot_id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 px-3 font-mono text-xs">{a.lot_code}</td>
                  <td className="py-2 px-3">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", EXPIRY_STATUS_COLORS[status])}>
                      {formatDate(a.expiry_date)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{a.available}</td>
                  <td className="py-2 px-3 text-right">
                    <Input
                      type="number"
                      min={0}
                      max={a.available}
                      value={a.allocated}
                      onChange={(e) => handleQtyChange(i, e.target.valueAsNumber || 0)}
                      className="h-7 w-20 text-right ml-auto"
                    />
                  </td>
                  <td className="py-2 px-3 text-right text-muted-foreground">
                    ฿{formatCurrency(a.allocated * a.unit_price)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-muted/20 border-t border-border">
              <td colSpan={3} className="py-2 px-3 text-xs font-medium">Total</td>
              <td className={cn("py-2 px-3 text-right font-semibold text-sm",
                !isValid && "text-destructive"
              )}>
                {totalAllocated}
                {!isValid && (
                  <span className="text-xs font-normal ml-1">
                    (need {totalRequested})
                  </span>
                )}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-sm">
                ฿{formatCurrency(allocations.reduce((s, a) => s + a.allocated * a.unit_price, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isValid && (
        <p className="text-xs text-destructive">
          Allocated quantity ({totalAllocated}) must equal requested quantity ({totalRequested}).
        </p>
      )}
    </div>
  );
}
