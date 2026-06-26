"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
  CommandSeparator,
} from "@/components/ui/command";

export interface SelectOption {
  id: number;
  name: string;
}

interface Props {
  options: SelectOption[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  onCreate?: (name: string) => Promise<number>; // returns new id
  disabled?: boolean;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  onCreate,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [localOptions, setLocalOptions] = useState<SelectOption[]>(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const selected = localOptions.find((o) => o.id === value);
  const filtered = localOptions.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );
  const canCreate =
    onCreate &&
    search.trim().length > 0 &&
    !localOptions.some(
      (o) => o.name.toLowerCase() === search.trim().toLowerCase()
    );

  async function handleCreate() {
    if (!onCreate || !search.trim()) return;
    setCreating(true);
    try {
      const newId = await onCreate(search.trim());
      const newOption = { id: newId, name: search.trim() };
      setLocalOptions((prev) => [...prev, newOption]);
      onChange(newId);
      setOpen(false);
      setSearch("");
    } finally {
      setCreating(false);
    }
  }

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
        <span className="truncate">{selected ? selected.name : placeholder}</span>
        <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50 ml-2" />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px]" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type to create…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {/* Clear selection */}
            {value !== null && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => { onChange(null); setOpen(false); setSearch(""); }}
                    className="text-muted-foreground text-xs"
                  >
                    — None
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onChange(opt.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {filtered.length === 0 && !canCreate && (
              <CommandEmpty>No results.</CommandEmpty>
            )}

            {canCreate && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={creating}
                    className="text-primary font-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {creating ? "Creating…" : `Create "${search.trim()}"`}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
