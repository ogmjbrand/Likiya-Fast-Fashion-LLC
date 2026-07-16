import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, InventoryLevel } from "@likiya/database";

export interface LowStockRow extends InventoryLevel {
  variant: { sku: string; title: string | null; product: { name: string; slug: string } };
}

/** Variants at or below their configured `low_stock_threshold`, for the admin low-stock alert list. */
export async function getLowStockLevels(
  supabase: SupabaseClient<Database>,
  warehouseId?: string,
): Promise<LowStockRow[]> {
  let query = supabase
    .from("inventory_levels")
    .select(
      "*, variant:product_variants(sku, title, product:products(name, slug))",
    )
    .order("quantity_on_hand", { ascending: true });

  if (warehouseId) query = query.eq("warehouse_id", warehouseId);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as LowStockRow[]).filter(
    (row) => row.quantity_on_hand <= row.low_stock_threshold,
  );
}
