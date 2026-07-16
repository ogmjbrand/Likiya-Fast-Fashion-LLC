import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@likiya/database";

export type InventoryMovementReason =
  | "sale"
  | "return"
  | "restock"
  | "adjustment"
  | "damaged"
  | "transfer_in"
  | "transfer_out"
  | "purchase_order_received";

export interface AdjustInventoryParams {
  variantId: string;
  warehouseId: string;
  quantityDelta: number;
  reason: InventoryMovementReason;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: string;
}

/**
 * Wraps the `adjust_inventory` Postgres function (see
 * supabase/migrations/00000000000008_functions_triggers.sql) so stock level
 * changes and their audit trail (`inventory_movements`) always happen
 * atomically, from one call site, regardless of caller (order fulfillment,
 * returns processing, manual admin adjustment, purchase order receipt).
 */
export async function adjustInventory(
  supabase: SupabaseClient<Database>,
  params: AdjustInventoryParams,
) {
  const { error } = await supabase.rpc("adjust_inventory", {
    p_variant_id: params.variantId,
    p_warehouse_id: params.warehouseId,
    p_quantity_delta: params.quantityDelta,
    p_reason: params.reason,
    p_reference_type: params.referenceType ?? null,
    p_reference_id: params.referenceId ?? null,
    p_note: params.note ?? null,
    p_created_by: params.createdBy ?? null,
  });

  if (error) throw error;
}
