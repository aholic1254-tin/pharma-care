"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MedicineFormDialog } from "./medicine-form-dialog";
import { DeleteMedicineDialog } from "./delete-medicine-dialog";
import type { DrugWithForm } from "@/lib/supabase/medicines";

interface DrugForm {
  id: number;
  name: string;
  sort_order: number;
}

interface Props {
  initialDrugs: DrugWithForm[];
  drugForms: DrugForm[];
}

export function MedicineTable({ initialDrugs, drugForms }: Props) {
  const [drugs, setDrugs] = useState<DrugWithForm[]>(initialDrugs);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editDrug, setEditDrug] = useState<DrugWithForm | null>(null);
  const [deleteDrug, setDeleteDrug] = useState<DrugWithForm | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/medicines");
    if (res.ok) {
      const data = await res.json();
      setDrugs(data);
    }
  }, []);

  const columns = useMemo<ColumnDef<DrugWithForm>[]>(
    () => [
      {
        accessorKey: "drug_id",
        header: "Drug ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {row.original.drug_id}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "name",
        header: "Drug Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.image_url ? (
              <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 border border-border">
                <Image
                  src={row.original.image_url}
                  alt={row.original.name}
                  fill
                  className="object-contain bg-muted"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-secondary shrink-0" />
            )}
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        id: "drug_form",
        accessorFn: (row) => row.drug_forms?.name ?? "",
        header: "Form",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs">
            {row.original.drug_forms?.name ?? "—"}
          </Badge>
        ),
        size: 110,
      },
      {
        accessorKey: "unit",
        header: "Unit",
        size: 80,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "minimum_stock",
        header: "Min Stock",
        size: 90,
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue() as number}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 80,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditDrug(row.original)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => setDeleteDrug(row.original)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: drugs,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or ID…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Medicine
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={canSort ? "cursor-pointer select-none" : ""}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-muted-foreground">
                            {sorted === "asc" ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : sorted === "desc" ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronsUpDown className="w-3 h-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-12 text-sm"
                >
                  {globalFilter ? "No medicines match your search." : "No medicines yet. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/20">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {table.getFilteredRowModel().rows.length} medicine
        {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
      </p>

      {/* Dialogs */}
      <MedicineFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        drugForms={drugForms}
        onSuccess={refresh}
      />
      <MedicineFormDialog
        open={!!editDrug}
        onOpenChange={(open) => { if (!open) setEditDrug(null); }}
        drugForms={drugForms}
        drug={editDrug}
        onSuccess={refresh}
      />
      <DeleteMedicineDialog
        open={!!deleteDrug}
        onOpenChange={(open) => { if (!open) setDeleteDrug(null); }}
        drug={deleteDrug}
        onSuccess={refresh}
      />
    </div>
  );
}
