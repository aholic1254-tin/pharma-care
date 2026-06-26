import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </p>
            <p
              className={cn(
                "text-2xl font-bold leading-none",
                variant === "warning" && "text-orange-500",
                variant === "danger" && "text-red-600"
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
              variant === "default" && "bg-secondary",
              variant === "warning" && "bg-orange-100",
              variant === "danger" && "bg-red-100"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                variant === "default" && "text-primary",
                variant === "warning" && "text-orange-500",
                variant === "danger" && "text-red-600"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            <div className="h-7 w-16 bg-muted animate-pulse rounded" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="w-10 h-10 bg-muted animate-pulse rounded-lg shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}
