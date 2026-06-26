"use client";

import { useState } from "react";
import { Download, TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils";
import { exportToExcel } from "@/lib/excel";
import { getExpiryStatus, EXPIRY_STATUS_COLORS } from "@/types";
import type {
  InventoryReportRow, ExpiryReportRow, MonthlyRow,
} from "@/lib/supabase/reports";

interface Props {
  inventory: InventoryReportRow[];
  expiry: ExpiryReportRow[];
  monthlyReceive: MonthlyRow[];
  monthlyDispense: MonthlyRow[];
  currentYear: number;
}

// ─── Inventory Report ─────────────────────────────────────────

function InventoryReport({ rows }: { rows: InventoryReportRow[] }) {
  const totalValue = rows.reduce((s, r) => s + r.total_value, 0);
  const lowStock = rows.filter((r) => r.total_quantity > 0 && r.total_quantity <= r.minimum_stock).length;
  const outOfStock = rows.filter((r) => r.total_quantity === 0).length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Medicines" value={rows.length} icon={<Package className="w-4 h-4" />} />
        <SummaryCard label="Total Value" value={`฿${formatCurrency(totalValue)}`} icon={<TrendingUp className="w-4 h-4" />} />
        <SummaryCard label="Low Stock" value={lowStock} icon={<AlertTriangle className="w-4 h-4" />} variant="warning" />
        <SummaryCard label="Out of Stock" value={outOfStock} icon={<TrendingDown className="w-4 h-4" />} variant="danger" />
      </div>

      <Button size="sm" variant="outline" onClick={() => exportToExcel(
        rows.map((r) => ({
          "Drug ID": r.drug_id, Medicine: r.name, Form: r.form, Unit: r.unit,
          "Min Stock": r.minimum_stock, "Total Qty": r.total_quantity,
          "Active LOTs": r.lot_count, "Total Value": r.total_value,
          Status: r.total_quantity === 0 ? "Out of Stock" : r.total_quantity <= r.minimum_stock ? "Low Stock" : "OK",
        })), "inventory_report")}>
        <Download className="w-4 h-4 mr-1.5" /> Export to Excel
      </Button>

      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {["Drug ID", "Medicine", "Form", "Unit", "Min Stock", "Qty", "LOTs", "Value", "Status"].map((h) => (
                <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const isOut = r.total_quantity === 0;
              const isLow = !isOut && r.total_quantity <= r.minimum_stock;
              return (
                <TableRow key={r.drug_id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs">{r.drug_id}</TableCell>
                  <TableCell className="font-medium text-sm">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.form}</TableCell>
                  <TableCell className="text-sm">{r.unit}</TableCell>
                  <TableCell className="text-sm">{formatNumber(r.minimum_stock)}</TableCell>
                  <TableCell className={`font-semibold text-sm ${isOut ? "text-red-600" : isLow ? "text-amber-600" : ""}`}>
                    {formatNumber(r.total_quantity)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.lot_count}</TableCell>
                  <TableCell className="text-sm">฿{formatCurrency(r.total_value)}</TableCell>
                  <TableCell>
                    {isOut ? <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      : isLow ? <Badge className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">Low Stock</Badge>
                      : <Badge variant="secondary" className="text-xs">OK</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Expiry Report ────────────────────────────────────────────

function ExpiryReport({ rows }: { rows: ExpiryReportRow[] }) {
  return (
    <div className="space-y-4">
      <Button size="sm" variant="outline" onClick={() => exportToExcel(
        rows.map((r) => ({
          "Drug ID": r.drug_id, Medicine: r.drug_name, LOT: r.lot_code,
          "Expiry Date": r.expiry_date, "Remaining Qty": r.remaining_quantity,
          "Unit Price": r.unit_price, Value: r.value, Supplier: r.supplier ?? "",
        })), "expiry_report")}>
        <Download className="w-4 h-4 mr-1.5" /> Export to Excel
      </Button>

      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {["Drug ID", "Medicine", "LOT", "Expiry Date", "Status", "Remaining Qty", "Value", "Supplier"].map((h) => (
                <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const status = getExpiryStatus(r.expiry_date);
              const badgeClass = EXPIRY_STATUS_COLORS[status];
              return (
                <TableRow key={i} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs">{r.drug_id}</TableCell>
                  <TableCell className="font-medium text-sm">{r.drug_name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.lot_code}</TableCell>
                  <TableCell className="text-sm">{formatDate(r.expiry_date)}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${badgeClass}`}>{status}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">{formatNumber(r.remaining_quantity)}</TableCell>
                  <TableCell className="text-sm">฿{formatCurrency(r.value)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.supplier ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Monthly Report ───────────────────────────────────────────

function MonthlyReport({ rows, type }: { rows: MonthlyRow[]; type: "receive" | "dispense" }) {
  const totalQty = rows.reduce((s, r) => s + r.total_quantity, 0);
  const totalVal = rows.reduce((s, r) => s + r.total_value, 0);
  const totalTx = rows.reduce((s, r) => s + r.transaction_count, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total Qty" value={formatNumber(totalQty)} icon={<Package className="w-4 h-4" />} />
        <SummaryCard label="Total Value" value={`฿${formatCurrency(totalVal)}`} icon={<TrendingUp className="w-4 h-4" />} />
        <SummaryCard label="Transactions" value={formatNumber(totalTx)} icon={<TrendingDown className="w-4 h-4" />} />
      </div>

      <Button size="sm" variant="outline" onClick={() => exportToExcel(
        rows.map((r) => ({
          Month: r.month, "Total Qty": r.total_quantity,
          "Total Value": r.total_value, Transactions: r.transaction_count,
        })), `monthly_${type}`)}>
        <Download className="w-4 h-4 mr-1.5" /> Export to Excel
      </Button>

      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {["Month", "Total Qty", "Total Value", "Transactions"].map((h) => (
                <TableHead key={h} className="text-xs whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10 text-sm">
                  No data for this year.
                </TableCell>
              </TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.month} className="hover:bg-muted/20">
                <TableCell className="font-medium text-sm">{r.month}</TableCell>
                <TableCell className="text-sm">{formatNumber(r.total_quantity)}</TableCell>
                <TableCell className="text-sm">฿{formatCurrency(r.total_value)}</TableCell>
                <TableCell className="text-sm">{formatNumber(r.transaction_count)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────

function SummaryCard({ label, value, icon, variant = "default" }: {
  label: string; value: string | number; icon: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}) {
  const colors = {
    default: "bg-white border-border",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
  }[variant];

  return (
    <div className={`rounded-lg border p-3 ${colors}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

// ─── Year Selector ────────────────────────────────────────────

function YearSelector({ value, onChange }: { value: number; onChange: (y: number) => void }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v ?? currentYear))}>
      <SelectTrigger className="w-28 h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Main export ─────────────────────────────────────────────

export function ReportsClient({ inventory, expiry, monthlyReceive, monthlyDispense, currentYear }: Props) {
  const [year, setYear] = useState(currentYear);

  const filteredReceive = monthlyReceive.filter((r) => r.month.startsWith(String(year)));
  const filteredDispense = monthlyDispense.filter((r) => r.month.startsWith(String(year)));

  return (
    <Tabs defaultValue="inventory">
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="expiry">Expiry</TabsTrigger>
        <TabsTrigger value="monthly-receive">Monthly Receive</TabsTrigger>
        <TabsTrigger value="monthly-dispense">Monthly Dispense</TabsTrigger>
      </TabsList>

      <TabsContent value="inventory">
        <InventoryReport rows={inventory} />
      </TabsContent>

      <TabsContent value="expiry">
        <ExpiryReport rows={expiry} />
      </TabsContent>

      <TabsContent value="monthly-receive">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Year:</span>
            <YearSelector value={year} onChange={setYear} />
          </div>
          <MonthlyReport rows={filteredReceive} type="receive" />
        </div>
      </TabsContent>

      <TabsContent value="monthly-dispense">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Year:</span>
            <YearSelector value={year} onChange={setYear} />
          </div>
          <MonthlyReport rows={filteredDispense} type="dispense" />
        </div>
      </TabsContent>
    </Tabs>
  );
}
