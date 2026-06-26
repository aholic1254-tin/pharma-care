"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

import { dispenseSchema, type DispenseFormValues, type LotAllocation } from "@/lib/validations/dispense";
import { computeFefo, totalAvailable } from "@/lib/fefo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { DrugCombobox } from "@/components/shared/drug-combobox";
import { ScanButton } from "@/components/shared/scan-button";
import { LotAllocationPreview } from "./lot-allocation-preview";
import type { DrugWithForm } from "@/lib/supabase/medicines";
import type { LotForDispense } from "@/lib/supabase/dispense";
import type { BarcodeMatch } from "@/lib/supabase/barcodes";

interface Props {
  drugs: DrugWithForm[];
  initialDrugId?: number;
}

export function DispenseForm({ drugs, initialDrugId = 0 }: Props) {
  const [lots, setLots] = useState<LotForDispense[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);
  const [allocations, setAllocations] = useState<LotAllocation[]>([]);
  const [allocationReady, setAllocationReady] = useState(false);

  const form = useForm<DispenseFormValues>({
    resolver: zodResolver(dispenseSchema),
    defaultValues: {
      drug_id: initialDrugId,
      dispense_date: format(new Date(), "yyyy-MM-dd"),
      quantity: 1,
      patient_name: "",
      note: "",
    },
  });

  const watchDrugId = form.watch("drug_id");
  const watchQty = form.watch("quantity");

  // Load lots when drug changes
  useEffect(() => {
    if (!watchDrugId) { setLots([]); setAllocations([]); setAllocationReady(false); return; }
    setLoadingLots(true);
    setAllocations([]);
    setAllocationReady(false);
    fetch(`/api/lots?drug_id=${watchDrugId}`)
      .then((r) => r.json())
      .then((data) => setLots(data))
      .finally(() => setLoadingLots(false));
  }, [watchDrugId]);

  // Reset allocation when qty or drug changes
  useEffect(() => {
    setAllocations([]);
    setAllocationReady(false);
  }, [watchDrugId, watchQty]);

  function handleComputeFefo() {
    const qty = form.getValues("quantity");
    if (!qty || qty < 1) { toast.error("Enter a valid quantity first"); return; }
    const result = computeFefo(lots, qty);
    if (!result) {
      toast.error(`Insufficient stock. Available: ${totalAvailable(lots)}`);
      return;
    }
    setAllocations(result);
    setAllocationReady(true);
  }

  async function onSubmit(values: DispenseFormValues) {
    if (!allocationReady || allocations.length === 0) {
      toast.error("Click 'Compute FEFO' to allocate stock first");
      return;
    }

    const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
    if (totalAllocated !== values.quantity) {
      toast.error("Allocated quantity must equal requested quantity");
      return;
    }

    // Validate none exceeds available
    for (const a of allocations) {
      if (a.allocated > a.available) {
        toast.error(`LOT ${a.lot_code}: allocated (${a.allocated}) exceeds available (${a.available})`);
        return;
      }
    }

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Insert one dispense_transaction + decrement lot per allocation
    for (const a of allocations) {
      if (a.allocated === 0) continue;

      const { error: txErr } = await db.from("dispense_transactions").insert({
        drug_id: values.drug_id,
        lot_id: a.lot_id,
        dispense_date: values.dispense_date,
        quantity: a.allocated,
        patient_name: values.patient_name || null,
        note: values.note || null,
      });
      if (txErr) { toast.error(txErr.message); return; }

      const { error: lotErr } = await db
        .from("lots")
        .update({ remaining_quantity: a.available - a.allocated })
        .eq("id", a.lot_id);
      if (lotErr) { toast.error(lotErr.message); return; }
    }

    toast.success("Dispense saved and inventory updated");
    form.reset({
      drug_id: 0,
      dispense_date: format(new Date(), "yyyy-MM-dd"),
      quantity: 1,
      patient_name: "",
      note: "",
    });
    setLots([]);
    setAllocations([]);
    setAllocationReady(false);
  }

  const available = totalAvailable(lots);
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Medicine */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Medicine</CardTitle>
                <ScanButton
                  onMatch={(match: BarcodeMatch) => form.setValue("drug_id", match.drug_id, { shouldValidate: true })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="drug_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine *</FormLabel>
                    <FormControl>
                      <DrugCombobox
                        drugs={drugs}
                        value={field.value || null}
                        onChange={(v) => field.onChange(v ?? 0)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchDrugId > 0 && (
                <div className="text-sm text-muted-foreground">
                  {loadingLots ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading stock…
                    </span>
                  ) : (
                    <span>
                      Available stock:{" "}
                      <span className={available === 0 ? "text-destructive font-semibold" : "font-semibold text-foreground"}>
                        {available}
                      </span>
                      {" "}units across {lots.length} LOT{lots.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dispense Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Dispense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dispense_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dispense Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={available || undefined}
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="patient_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional note…" rows={2} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* LOT Allocation */}
          {watchDrugId > 0 && !loadingLots && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">LOT Allocation (FEFO)</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleComputeFefo}
                    disabled={isSubmitting || available === 0}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Compute FEFO
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {available === 0 ? (
                  <Alert>
                    <AlertDescription className="text-sm">
                      No stock available for this medicine.
                    </AlertDescription>
                  </Alert>
                ) : !allocationReady ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Click <strong>Compute FEFO</strong> to auto-allocate LOTs, then adjust manually if needed.
                  </p>
                ) : (
                  <LotAllocationPreview
                    allocations={allocations}
                    onChange={setAllocations}
                    totalRequested={watchQty}
                  />
                )}
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setLots([]);
                setAllocations([]);
                setAllocationReady(false);
              }}
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !allocationReady}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Dispense
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
