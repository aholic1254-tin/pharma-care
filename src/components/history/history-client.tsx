"use client";

import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { exportToExcel } from "@/lib/excel";
import type { ReceiveHistoryRow, DispenseHistoryRow } from "@/lib/supabase/history";

interface Props {
  receiveRows: ReceiveHistoryRow[];
  dispenseRows: DispenseHistoryRow[];
}

// ─── Receive History Table ────────────────────────────────────

function ReceiveTable({ rows }: { rows: ReceiveHistoryRow[] }) {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    let r = rows;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.drugs?.name.toLowerCase().includes(q) ||
          x.drugs?.drug_id.toLowerCase().includes(q) ||
          x.lot_code.toLowerCase().includes(q) ||
          x.suppliers?.name.toLowerCase().includes(q)
      );
    }
    if (from) r = r.filter((x) => x.receive_date >= from);
    if (to) r = r.filter((x) => x.receive_date <= to);
    return r;
  }, [rows, search, from, to]);

  const columns = useMemo<ColumnDef<ReceiveHistoryRow>[]>(() => [
    { accessorKey: "receive_date", header: "Date", cell: ({ getValue }) => formatDate(getValue() as string), size: 100 },
    { id: "drug", header: "Medicine", accessorFn: (r) => r.drugs?.name ?? "",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.drugs?.name ?? "—"}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.drugs?.drug_id}</div>
        </div>
      ),
    },
    { accessorKey: "lot_code", header: "LOT", cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
    { accessorKey: "expiry_date", header: "Expiry", cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: "quantity", header: "Qty", cell: ({ getValue }) => <span className="font-medium">{getValue() as number}</span> },
    { accessorKey: "unit_price", header: "Unit Price", cell: ({ getValue }) => `฿${formatCurrency(getValue() as number)}` },
    { id: "value", header: "Value", accessorFn: (r) => r.quantity * r.unit_price,
      cell: ({ getValue }) => `฿${formatCurrency(getValue() as number)}` },
    { id: "supplier", header: "Supplier", accessorFn: (r) => r.suppliers?.name ?? "—",
      cell: ({ getValue }) => <span className="text-muted-foreground text-sm">{getValue() as string}</span> },
    { accessorKey: "note", header: "Note", cell: ({ getValue }) => <span className="text-muted-foreground text-sm truncate max-w-[120px] block">{(getValue() as string) || "—"}</span> },
  ], []);

  const table = useReactTable({
    data: filtered, columns, state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  function handleExport() {
    exportToExcel(
      filtered.map((r) => ({
        Date: r.receive_date,
        "Drug ID": r.drugs?.drug_id ?? "",
        Medicine: r.drugs?.name ?? "",
        LOT: r.lot_code,
        Expiry: r.expiry_date,
        Quantity: r.quantity,
        "Unit Price": r.unit_price,
        Value: r.quantity * r.unit_price,
        Supplier: r.suppliers?.name ?? "",
        Note: r.note ?? "",
      })),
      "receive_history"
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36" />
        <span className="text-muted-foreground text-sm">to</span>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36" />
        <Button size="sm" variant="outline" onClick={handleExport} className="ml-auto">
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>
      <HistoryTableView table={table} colCount={columns.length} />
    </div>
  );
}

// ─── Dispense History Table ───────────────────────────────────

function DispenseTable({ rows }: { rows: DispenseHistoryRow[] }) {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtered = useMemo(() => {
    let r = rows;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.drugs?.name.toLowerCase().includes(q) ||
          x.drugs?.drug_id.toLowerCase().includes(q) ||
          x.lots?.lot_code.toLowerCase().includes(q) ||
          (x.patient_name ?? "").toLowerCase().includes(q)
      );
    }
    if (from) r = r.filter((x) => x.dispense_date >= from);
    if (to) r = r.filter((x) => x.dispense_date <= to);
    return r;
  }, [rows, search, from, to]);

  const columns = useMemo<ColumnDef<DispenseHistoryRow>[]>(() => [
    { accessorKey: "dispense_date", header: "Date", cell: ({ getValue }) => formatDate(getValue() as string), size: 100 },
    { id: "drug", header: "Medicine", accessorFn: (r) => r.drugs?.name ?? "",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.drugs?.name ?? "—"}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.drugs?.drug_id}</div>
        </div>
      ),
    },
    { id: "lot", header: "LOT", accessorFn: (r) => r.lots?.lot_code ?? "—",
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
    { accessorKey: "quantity", header: "Qty", cell: ({ getValue }) => <span className="font-medium">{getValue() as number}</span> },
    { id: "patient", header: "Patient", accessorFn: (r) => r.patient_name ?? "",
      cell: ({ row }) => row.original.patient_name
        ? <Badge variant="secondary" className="text-xs font-normal">{row.original.patient_name}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
    { accessorKey: "note", header: "Note",
      cell: ({ getValue }) => <span className="text-muted-foreground text-sm truncate max-w-[140px] block">{(getValue() as string) || "—"}</span> },
  ], []);

  const table = useReactTable({
    data: filtered, columns, state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  function handleExport() {
    exportToExcel(
      filtered.map((r) => ({
        Date: r.dispense_date,
        "Drug ID": r.drugs?.drug_id ?? "",
        Medicine: r.drugs?.name ?? "",
        LOT: r.lots?.lot_code ?? "",
        Quantity: r.quantity,
        Patient: r.patient_name ?? "",
        Note: r.note ?? "",
      })),
      "dispense_history"
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36" />
        <span className="text-muted-foreground text-sm">to</span>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36" />
        <Button size="sm" variant="outline" onClick={handleExport} className="ml-auto">
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>
      <HistoryTableView table={table} colCount={columns.length} />
    </div>
  );
}

// ─── Shared table renderer ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HistoryTableView({ table, colCount }: { table: any; colCount: number }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg: any) => (
              <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                {hg.headers.map((h: any) => (
                  <TableHead key={h.id} className="text-xs cursor-pointer whitespace-nowrap"
                    onClick={h.column.getToggleSortingHandler()}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="text-center text-muted-foreground py-12 text-sm">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row: any) => (
                <TableRow key={row.id} className="hover:bg-muted/20">
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id} className="py-2 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length} records
          {" · "}Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 w-7 p-0"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────

export function HistoryClient({ receiveRows, dispenseRows }: Props) {
  return (
    <Tabs defaultValue="receive">
      <TabsList className="mb-4">
        <TabsTrigger value="receive">Receive History</TabsTrigger>
        <TabsTrigger value="dispense">Dispense History</TabsTrigger>
      </TabsList>
      <TabsContent value="receive">
        <ReceiveTable rows={receiveRows} />
      </TabsContent>
      <TabsContent value="dispense">
        <DispenseTable rows={dispenseRows} />
      </TabsContent>
    </Tabs>
  );
}
