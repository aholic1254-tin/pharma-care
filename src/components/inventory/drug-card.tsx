"use client";

import Image from "next/image";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DrugInventory } from "@/lib/supabase/inventory";

interface Props {
  drug: DrugInventory;
  onClick: () => void;
}

export function DrugCard({ drug, onClick }: Props) {
  const isLow = drug.totalQuantity <= drug.minimum_stock;
  const outOfStock = drug.totalQuantity === 0;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer hover:shadow-md hover:border-primary/40 transition-all select-none",
        outOfStock && "opacity-60"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Image */}
        <div className="relative w-full h-24 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {drug.image_url ? (
            <Image src={drug.image_url} alt={drug.name} fill className="object-contain p-2" />
          ) : (
            <span className="text-3xl select-none">💊</span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <p className="font-mono text-xs text-muted-foreground">{drug.drug_id}</p>
          <p className="font-semibold text-sm leading-tight line-clamp-2">{drug.name}</p>
          <Badge variant="secondary" className="text-xs">
            {drug.drug_forms?.name ?? "—"}
          </Badge>
        </div>

        <div className="border-t border-border pt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stock</span>
            <span className={cn(
              "text-sm font-bold",
              outOfStock ? "text-destructive" : isLow ? "text-orange-500" : "text-foreground"
            )}>
              {formatNumber(drug.totalQuantity)}
              <span className="text-xs font-normal text-muted-foreground ml-1">{drug.unit}</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Value</span>
            <span className="text-xs font-medium">฿{formatCurrency(drug.totalValue)}</span>
          </div>
        </div>

        {isLow && !outOfStock && (
          <p className="text-xs text-orange-500 font-medium">⚠ Low stock</p>
        )}
        {outOfStock && (
          <p className="text-xs text-destructive font-medium">✕ Out of stock</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DrugCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="w-full h-24 rounded-md bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="border-t border-border pt-2 space-y-2">
          <div className="h-3 w-full bg-muted animate-pulse rounded" />
          <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
