import "server-only";

import { createClient } from "@likiya/database/server";
import type { Product, ProductStatus } from "@likiya/database";

export interface AdminProductListRow {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  base_price: number;
  currency: string;
  is_featured: boolean;
  brand: { name: string } | null;
}

export async function getAdminProductList(page = 1, pageSize = 20) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("products")
    .select("id, name, slug, status, base_price, currency, is_featured, brand:brands(name)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    products: (data ?? []) as unknown as AdminProductListRow[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export interface AdminProductDetail extends Product {
  brand: { name: string } | null;
  variants: { id: string; sku: string; title: string | null; price: number; is_active: boolean }[];
  images: { id: string; url: string; alt_text: string | null }[];
}

export async function getAdminProductDetail(productId: string): Promise<AdminProductDetail | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*, brand:brands(name), variants:product_variants(id, sku, title, price, is_active), images:product_images(id, url, alt_text)",
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;
  return product as unknown as AdminProductDetail | null;
}
