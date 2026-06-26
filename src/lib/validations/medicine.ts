import { z } from "zod";

export const medicineSchema = z.object({
  drug_id: z.string().min(1, "Drug ID is required"),
  name: z.string().min(1, "Drug name is required"),
  drug_form_id: z.number().min(1, "Drug form is required"),
  unit: z.string().min(1, "Unit is required"),
  minimum_stock: z.number().min(0, "Minimum stock must be ≥ 0"),
  image_url: z.string().nullable().optional(),
});

export type MedicineFormValues = z.infer<typeof medicineSchema>;

export const UNITS = [
  "tablet",
  "capsule",
  "bottle",
  "vial",
  "ampule",
  "tube",
  "sachet",
  "patch",
  "drop",
  "unit",
] as const;
