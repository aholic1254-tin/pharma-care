import type { LotForDispense } from "@/lib/supabase/dispense";
import type { LotAllocation } from "@/lib/validations/dispense";

/**
 * Compute FEFO allocation: fill from earliest-expiry LOT first.
 * Returns null if total available stock < requested quantity.
 */
export function computeFefo(
  lots: LotForDispense[],
  quantity: number
): LotAllocation[] | null {
  // lots are already sorted by expiry_date asc from the query
  const result: LotAllocation[] = [];
  let remaining = quantity;

  for (const lot of lots) {
    if (remaining <= 0) break;
    const take = Math.min(lot.remaining_quantity, remaining);
    result.push({
      lot_id: lot.id,
      lot_code: lot.lot_code,
      expiry_date: lot.expiry_date,
      available: lot.remaining_quantity,
      allocated: take,
      unit_price: Number(lot.unit_price),
      supplier_name: lot.suppliers?.name ?? null,
      package_type_name: lot.package_types?.name ?? null,
    });
    remaining -= take;
  }

  if (remaining > 0) return null; // insufficient stock
  return result;
}

/**
 * Total available stock across all lots.
 */
export function totalAvailable(lots: LotForDispense[]): number {
  return lots.reduce((s, l) => s + l.remaining_quantity, 0);
}
