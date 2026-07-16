"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import { logActivity } from "@likiya/database/activity-log";
import { requireStaff } from "@likiya/auth/server";
import type { ProductStatus } from "@likiya/database";

export async function updateProductStatus(productId: string, status: ProductStatus) {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status, published_at: status === "active" ? new Date().toISOString() : null })
    .eq("id", productId);

  if (error) throw error;

  await logActivity(supabase, {
    actorId: staff.id,
    action: "product.status_changed",
    entityType: "product",
    entityId: productId,
    metadata: { status },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

export async function toggleProductFeatured(productId: string, isFeatured: boolean) {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_featured: isFeatured })
    .eq("id", productId);

  if (error) throw error;

  await logActivity(supabase, {
    actorId: staff.id,
    action: "product.featured_toggled",
    entityType: "product",
    entityId: productId,
    metadata: { isFeatured },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}
