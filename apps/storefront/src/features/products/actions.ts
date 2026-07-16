"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import { requireUser } from "@likiya/auth/server";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  productSlug: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

export type ReviewActionState = { error: string | null } | null;

export async function submitReview(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const user = await requireUser();

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    body: formData.get("body") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const supabase = await createClient();

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", parsed.data.productId)
    .eq("user_id", user.id)
    .is("order_item_id", null)
    .maybeSingle();

  if (existingReview) {
    return { error: "You've already reviewed this product." };
  }

  // A verified purchase is any completed order containing this product.
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id, order:orders!inner(user_id, status)")
    .eq("variant_id", parsed.data.productId)
    .maybeSingle();

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    body: parsed.data.body ?? null,
    is_verified_purchase: Boolean(orderItem),
  });

  if (error) {
    return { error: "Something went wrong submitting your review." };
  }

  revalidatePath(`/products/${parsed.data.productSlug}`);
  return { error: null };
}
