"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

import { receiveSchema, type ReceiveFormValues } from "@/lib/validations/receive";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DrugCombobox } from "@/components/shared/drug-combobox";
import { CreatableSelect, type SelectOption } from "@/components/shared/creatable-select";
import { ScanButton } from "@/components/shared/scan-button";
import type { DrugWithForm } from "@/lib/supabase/medicines";
import type { BarcodeMatch } from "@/lib/supabase/barcodes";

interface Props {
  drugs: DrugWithForm[];
  initialSuppliers: SelectOption[];
  initialPackageTypes: SelectOption[];
  initialDrugId?: number;
}

export function ReceiveForm({ drugs, initialSuppliers, initialPackageTypes, initialDrugId = 0 }: Props) {
  const [suppliers, setSuppliers] = useState<SelectOption[]>(initialSuppliers);
  const [packageTypes, setPackageTypes] = useState<SelectOption[]>(initialPackageTypes);

  const form = useForm<ReceiveFormValues>({
    resolver: zodResolver(receiveSchema),
    defaultValues: {
      drug_id: initialDrugId,
      receive_date: format(new Date(), "yyyy-MM-dd"),
      lot_code: "",
      quantity: 1,
      expiry_date: "",
      unit_price: 0,
      package_type_id: null,
      supplier_id: null,
      note: "",
    },
  });

  async function createSupplier(name: string): Promise<number> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("suppliers")
      .insert({ name })
      .select("id")
      .single();
    if (error) { toast.error("Failed to create supplier"); throw error; }
    const newSupplier = { id: data.id, name };
    setSuppliers((prev) => [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name)));
    return data.id;
  }

  async function createPackageType(name: string): Promise<number> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("package_types")
      .insert({ name })
      .select("id")
      .single();
    if (error) { toast.error("Failed to create package type"); throw error; }
    const newPkg = { id: data.id, name };
    setPackageTypes((prev) => [...prev, newPkg].sort((a, b) => a.name.localeCompare(b.name)));
    return data.id;
  }

  async function onSubmit(values: ReceiveFormValues) {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // 1. Upsert LOT — if same drug+lot_code exists, add to quantity
    const { data: existingLots } = await db
      .from("lots")
      .select("id, remaining_quantity")
      .eq("drug_id", values.drug_id)
      .eq("lot_code", values.lot_code)
      .limit(1);

    let lotId: number;

    if (existingLots && existingLots.length > 0) {
      // Update existing LOT
      const existing = existingLots[0];
      const { error } = await db
        .from("lots")
        .update({
          remaining_quantity: existing.remaining_quantity + values.quantity,
          unit_price: values.unit_price,
          expiry_date: values.expiry_date,
          supplier_id: values.supplier_id,
          package_type_id: values.package_type_id,
        })
        .eq("id", existing.id);
      if (error) { toast.error(error.message); return; }
      lotId = existing.id;
    } else {
      // Insert new LOT
      const { data: newLot, error } = await db
        .from("lots")
        .insert({
          drug_id: values.drug_id,
          lot_code: values.lot_code,
          receive_date: values.receive_date,
          expiry_date: values.expiry_date,
          remaining_quantity: values.quantity,
          unit_price: values.unit_price,
          supplier_id: values.supplier_id,
          package_type_id: values.package_type_id,
        })
        .select("id")
        .single();
      if (error) { toast.error(error.message); return; }
      lotId = newLot.id;
    }

    // 2. Record receive transaction
    const { error: txError } = await db.from("receive_transactions").insert({
      drug_id: values.drug_id,
      lot_id: lotId,
      receive_date: values.receive_date,
      lot_code: values.lot_code,
      quantity: values.quantity,
      expiry_date: values.expiry_date,
      unit_price: values.unit_price,
      supplier_id: values.supplier_id,
      package_type_id: values.package_type_id,
      note: values.note || null,
    });

    if (txError) { toast.error(txError.message); return; }

    toast.success("Medicine received and inventory updated");
    form.reset({
      drug_id: 0,
      receive_date: format(new Date(), "yyyy-MM-dd"),
      lot_code: "",
      quantity: 1,
      expiry_date: "",
      unit_price: 0,
      package_type_id: null,
      supplier_id: null,
      note: "",
    });
  }

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
            <CardContent>
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
            </CardContent>
          </Card>

          {/* LOT Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">LOT Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="receive_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receive Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lot_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LOT Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. LOT2024001" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (฿)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
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
            </CardContent>
          </Card>

          {/* Supplier & Packaging */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Supplier &amp; Packaging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <CreatableSelect
                          options={suppliers}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select or create…"
                          onCreate={createSupplier}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="package_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Type</FormLabel>
                      <FormControl>
                        <CreatableSelect
                          options={packageTypes}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select or create…"
                          onCreate={createPackageType}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardContent className="pt-4">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional note…"
                        rows={3}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Receive
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
