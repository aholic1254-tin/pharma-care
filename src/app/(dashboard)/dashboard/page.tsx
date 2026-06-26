import { Suspense } from "react";
import {
  Pill,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingDown,
  PackagePlus,
  PackageMinus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import {
  RecentReceiveTable,
  RecentDispenseTable,
  TransactionTableSkeleton,
} from "@/components/dashboard/recent-transactions";
import {
  getDashboardStats,
  getRecentReceive,
  getRecentDispense,
  type RecentReceiveRow,
  type RecentDispenseRow,
} from "@/lib/supabase/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

// ─── Stats Section ────────────────────────────────────────────

async function StatsSection() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Medicines"
        value={formatNumber(stats.totalMedicines)}
        icon={Pill}
      />
      <StatCard
        title="Current Inventory"
        value={formatNumber(stats.totalQuantity)}
        subtitle="units in stock"
        icon={Package}
      />
      <StatCard
        title="Inventory Value"
        value={`฿${formatCurrency(stats.inventoryValue)}`}
        icon={DollarSign}
      />
      <StatCard
        title="Expiring ≤ 30 Days"
        value={formatNumber(stats.expiringWithin30Days)}
        subtitle="LOTs expiring soon"
        icon={AlertTriangle}
        variant={stats.expiringWithin30Days > 0 ? "warning" : "default"}
      />
      <StatCard
        title="Low Stock"
        value={formatNumber(stats.lowStockCount)}
        subtitle="medicines below minimum"
        icon={TrendingDown}
        variant={stats.lowStockCount > 0 ? "danger" : "default"}
      />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Recent Receive Section ───────────────────────────────────

async function RecentReceiveSection() {
  const rows = await getRecentReceive();
  return <RecentReceiveTable rows={rows as RecentReceiveRow[]} />;
}

// ─── Recent Dispense Section ──────────────────────────────────

async function RecentDispenseSection() {
  const rows = await getRecentDispense();
  return <RecentDispenseTable rows={rows as RecentDispenseRow[]} />;
}

// ─── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Receive */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-primary" />
              Recent Receive
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <Suspense fallback={<TransactionTableSkeleton />}>
              <RecentReceiveSection />
            </Suspense>
          </CardContent>
        </Card>

        {/* Recent Dispense */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PackageMinus className="w-4 h-4 text-primary" />
              Recent Dispense
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <Suspense fallback={<TransactionTableSkeleton />}>
              <RecentDispenseSection />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
