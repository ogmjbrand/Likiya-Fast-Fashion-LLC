"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import type { DiscountType } from "@likiya/database";

export interface CreateCouponInput {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minSubtotal: number;
  maxUsesPerUser: number;
}

export async function createCoupon(input: CreateCouponInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    code: input.code.toUpperCase(),
    description: input.description,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_subtotal: input.minSubtotal,
    max_uses_per_user: input.maxUsesPerUser,
    is_active: true,
  });

  if (error) throw error;
  revalidatePath("/coupons");
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("id", couponId);
  if (error) throw error;
  revalidatePath("/coupons");
}
