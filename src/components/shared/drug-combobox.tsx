"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { DrugWithForm } from "@/lib/supabase/medicines";

interface Props {
  drugs: DrugWithForm[];
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

export function DrugCombobox({ drugs, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = drugs.find((d) => d.id === value);

  const filtered = drugs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.drug_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-between font-normal h-9",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selected ? `${selected.drug_id} — ${selected.name}` : "Select medicine…"}
        </span>
        <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50 ml-2" />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]" align="start">
        <Command>
          <CommandInput
            placeholder="Search by name or ID…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No medicines found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((drug) => (
                <CommandItem
                  key={drug.id}
                  value={`${drug.drug_id} ${drug.name}`}
                  onSelect={() => {
                    onChange(drug.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === drug.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {drug.drug_id}
                    </span>
                    <span className="truncate">{drug.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {drug.drug_forms?.name}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
