"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import type { ProductStatus } from "@likiya/database";

export async function updateProductStatus(productId: string, status: ProductStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status, published_at: status === "active" ? new Date().toISOString() : null })
    .eq("id", productId);

  if (error) throw error;
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

export async function toggleProductFeatured(productId: string, isFeatured: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_featured: isFeatured })
    .eq("id", productId);

  if (error) throw error;
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}
