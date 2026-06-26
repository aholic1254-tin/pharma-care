"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DrugCard } from "./drug-card";
import { LotDetailDialog } from "./lot-detail-dialog";
import type { DrugInventory, LotDetail } from "@/lib/supabase/inventory";

interface Props {
  drugs: DrugInventory[];
}

const FILTERS = [
  { value: "all", label: "All Medicines" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
  { value: "ok", label: "In Stock" },
];

export function InventoryGrid({ drugs }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedDrug, setSelectedDrug] = useState<DrugInventory | null>(null);
  const [lots, setLots] = useState<LotDetail[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingLots, setLoadingLots] = useState(false);

  const filtered = useMemo(() => {
    let result = drugs;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.drug_id.toLowerCase().includes(q)
      );
    }

    if (filter === "low") result = result.filter((d) => d.totalQuantity > 0 && d.totalQuantity <= d.minimum_stock);
    if (filter === "out") result = result.filter((d) => d.totalQuantity === 0);
    if (filter === "ok") result = result.filter((d) => d.totalQuantity > d.minimum_stock);

    return result;
  }, [drugs, search, filter]);

  async function handleCardClick(drug: DrugInventory) {
    setSelectedDrug(drug);
    setDialogOpen(true);
    setLoadingLots(true);
    try {
      const res = await fetch(`/api/lots/detail?drug_id=${drug.id}`);
      const data = await res.json();
      setLots(data);
    } finally {
      setLoadingLots(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v ?? "all")}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} medicine{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No medicines match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((drug) => (
            <DrugCard key={drug.id} drug={drug} onClick={() => handleCardClick(drug)} />
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <LotDetailDialog
        drug={selectedDrug}
        lots={loadingLots ? [] : lots}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
