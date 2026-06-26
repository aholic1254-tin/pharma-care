import { z } from "zod";

export const dispenseSchema = z.object({
  drug_id: z.number().min(1, "Medicine is required"),
  dispense_date: z.string().min(1, "Dispense date is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  patient_name: z.string().optional(),
  note: z.string().optional(),
});

export type DispenseFormValues = z.infer<typeof dispenseSchema>;

// One allocated slot per LOT (computed from FEFO or manual override)
export interface LotAllocation {
  lot_id: number;
  lot_code: string;
  expiry_date: string;
  available: number;
  allocated: number;
  unit_price: number;
  supplier_name: string | null;
  package_type_name: string | null;
}
