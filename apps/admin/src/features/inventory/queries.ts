import "server-only";

import { createClient } from "@likiya/database/server";

export interface InventoryListRow {
  id: string;
  variant_id: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  variant: { sku: string; title: string | null; product: { name: string } };
  warehouse: { name: string };
}

export async function getInventoryList(page = 1, pageSize = 30) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("inventory_levels")
    .select(
      "id, variant_id, warehouse_id, quantity_on_hand, quantity_reserved, low_stock_threshold, variant:product_variants(sku, title, product:products(name)), warehouse:warehouses(name)",
      { count: "exact" },
    )
    .order("quantity_on_hand", { ascending: true })
    .range(from, to);

  if (error) throw error;

  return {
    levels: (data ?? []) as unknown as InventoryListRow[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}
