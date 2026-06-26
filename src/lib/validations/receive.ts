import { z } from "zod";

export const receiveSchema = z.object({
  drug_id: z.number().min(1, "Medicine is required"),
  receive_date: z.string().min(1, "Receive date is required"),
  lot_code: z.string().min(1, "LOT code is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  unit_price: z.number().min(0, "Unit price must be ≥ 0"),
  package_type_id: z.number().nullable(),
  supplier_id: z.number().nullable(),
  note: z.string().optional(),
});

export type ReceiveFormValues = z.infer<typeof receiveSchema>;
