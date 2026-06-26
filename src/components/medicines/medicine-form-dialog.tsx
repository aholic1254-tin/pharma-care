"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

import { medicineSchema, type MedicineFormValues, UNITS } from "@/lib/validations/medicine";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DrugWithForm } from "@/lib/supabase/medicines";

interface DrugForm {
  id: number;
  name: string;
  sort_order: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drugForms: DrugForm[];
  drug?: DrugWithForm | null;
  onSuccess: () => void;
}

export function MedicineFormDialog({
  open,
  onOpenChange,
  drugForms,
  drug,
  onSuccess,
}: Props) {
  const isEdit = !!drug;
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      drug_id: "",
      name: "",
      drug_form_id: 0,
      unit: "tablet",
      minimum_stock: 0,
      image_url: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (drug) {
        form.reset({
          drug_id: drug.drug_id,
          name: drug.name,
          drug_form_id: drug.drug_form_id,
          unit: drug.unit,
          minimum_stock: drug.minimum_stock,
          image_url: drug.image_url ?? null,
        });
        setPreviewUrl(drug.image_url ?? null);
      } else {
        form.reset({
          drug_id: "",
          name: "",
          drug_form_id: 0,
          unit: "tablet",
          minimum_stock: 0,
          image_url: null,
        });
        setPreviewUrl(null);
      }
    }
  }, [open, drug, form]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `medicines/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("medicine-images")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Image upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("medicine-images")
      .getPublicUrl(path);

    form.setValue("image_url", urlData.publicUrl);
    setPreviewUrl(urlData.publicUrl);
    setUploading(false);
  }

  function handleRemoveImage() {
    form.setValue("image_url", null);
    setPreviewUrl(null);
  }

  async function onSubmit(values: MedicineFormValues) {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    if (isEdit && drug) {
      const { error } = await db
        .from("drugs")
        .update({
          drug_id: values.drug_id,
          name: values.name,
          drug_form_id: values.drug_form_id,
          unit: values.unit,
          minimum_stock: values.minimum_stock,
          image_url: values.image_url ?? null,
        })
        .eq("id", drug.id);

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Medicine updated");
    } else {
      const { error } = await db.from("drugs").insert({
        drug_id: values.drug_id,
        name: values.name,
        drug_form_id: values.drug_form_id,
        unit: values.unit,
        minimum_stock: values.minimum_stock,
        image_url: values.image_url ?? null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Drug ID already exists");
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("Medicine added");
    }

    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="drug_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drug ID</FormLabel>
                    <FormControl>
                      <Input placeholder="D001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drug_form_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drug Form</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drugForms.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drug Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Amoxicillin 500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimum_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Image (optional)</FormLabel>
              {previewUrl ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={previewUrl}
                    alt="Medicine"
                    fill
                    className="object-contain bg-muted"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Click to upload (max 2 MB)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
                {form.formState.isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEdit ? "Save Changes" : "Add Medicine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
