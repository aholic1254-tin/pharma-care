// ─── Drug Forms ───────────────────────────────────────────────────────────────

export type DrugFormName =
  | "Tablet"
  | "Syrup"
  | "Injection"
  | "External Use"
  | "Herbal";

export const DRUG_FORM_ORDER: DrugFormName[] = [
  "Tablet",
  "Syrup",
  "Injection",
  "External Use",
  "Herbal",
];

// ─── Master Tables ─────────────────────────────────────────────────────────────

export interface DrugForm {
  id: number;
  name: DrugFormName;
  sort_order: number;
}

export interface Supplier {
  id: number;
  name: string;
  created_at: string;
}

export interface PackageType {
  id: number;
  name: string;
  created_at: string;
}

// ─── Drug ─────────────────────────────────────────────────────────────────────

export interface Drug {
  id: number;
  drug_id: string;
  name: string;
  drug_form_id: number;
  unit: string;
  minimum_stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  // joined
  drug_form?: DrugForm;
}

export interface DrugBarcode {
  id: number;
  drug_id: number;
  barcode: string;
  created_at: string;
}

// ─── LOT ──────────────────────────────────────────────────────────────────────

export interface Lot {
  id: number;
  drug_id: number;
  lot_code: string;
  receive_date: string;
  expiry_date: string;
  remaining_quantity: number;
  unit_price: number;
  supplier_id: number | null;
  package_type_id: number | null;
  created_at: string;
  updated_at: string;
  // joined
  supplier?: Supplier;
  package_type?: PackageType;
  drug?: Drug;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface ReceiveTransaction {
  id: number;
  drug_id: number;
  lot_id: number;
  receive_date: string;
  lot_code: string;
  quantity: number;
  expiry_date: string;
  unit_price: number;
  package_type_id: number | null;
  supplier_id: number | null;
  note: string | null;
  created_at: string;
  // joined
  drug?: Drug;
  supplier?: Supplier;
  package_type?: PackageType;
}

export interface DispenseTransaction {
  id: number;
  drug_id: number;
  lot_id: number;
  dispense_date: string;
  quantity: number;
  patient_name: string | null;
  note: string | null;
  created_at: string;
  // joined
  drug?: Drug;
  lot?: Lot;
  supplier?: Supplier;
  package_type?: PackageType;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalMedicines: number;
  totalLots: number;
  inventoryValue: number;
  expiringWithin30Days: number;
  lowStockMedicines: number;
}

// ─── Inventory View ───────────────────────────────────────────────────────────

export interface DrugInventorySummary {
  drug: Drug;
  totalQuantity: number;
  totalValue: number;
  lots: Lot[];
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface ReceiveFormValues {
  drug_id: number;
  receive_date: string;
  lot_code: string;
  quantity: number;
  expiry_date: string;
  unit_price: number;
  package_type_id: number | null;
  supplier_id: number | null;
  note: string;
}

export interface DispenseFormValues {
  drug_id: number;
  dispense_date: string;
  quantity: number;
  patient_name: string;
  note: string;
}

export interface LotAllocation {
  lot: Lot;
  quantity: number;
}

// ─── Expiry Status ────────────────────────────────────────────────────────────

export type ExpiryStatus = "expired" | "critical" | "warning" | "near" | "ok";

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "expired";
  if (diffDays < 7) return "critical";
  if (diffDays <= 30) return "warning";
  if (diffDays <= 60) return "near";
  return "ok";
}

export const EXPIRY_STATUS_COLORS: Record<ExpiryStatus, string> = {
  expired: "bg-red-900 text-white",
  critical: "bg-red-500 text-white",
  warning: "bg-orange-400 text-white",
  near: "bg-yellow-400 text-black",
  ok: "bg-green-500 text-white",
};
