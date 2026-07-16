"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@likiya/database/server";
import { requireUser, getCurrentUser } from "@likiya/auth/server";
import type { AddressType } from "@likiya/database";

const addressSchema = z.object({
  type: z.enum(["shipping", "billing"]).default("shipping"),
  fullName: z.string().min(2),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  countryCode: z.string().length(2),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressActionState = { error: string | null } | null;

export async function saveAddress(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const user = await requireUser();

  const parsed = addressSchema.safeParse({
    type: (formData.get("type") as AddressType) ?? "shipping",
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    postalCode: formData.get("postalCode"),
    countryCode: formData.get("countryCode"),
    phone: formData.get("phone") || undefined,
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }

  const supabase = await createClient();

  if (parsed.data.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    type: parsed.data.type,
    full_name: parsed.data.fullName,
    line1: parsed.data.line1,
    line2: parsed.data.line2 ?? null,
    city: parsed.data.city,
    state: parsed.data.state ?? null,
    postal_code: parsed.data.postalCode,
    country_code: parsed.data.countryCode,
    phone: parsed.data.phone ?? null,
    is_default: parsed.data.isDefault ?? false,
  });

  if (error) return { error: "Could not save address." };

  revalidatePath("/account/addresses");
  return { error: null };
}

export async function deleteAddress(addressId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);
  revalidatePath("/account/addresses");
}

export async function removeWishlistItem(wishlistItemId: string) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("wishlist_items").delete().eq("id", wishlistItemId);
  revalidatePath("/account/wishlist");
}

export async function addToWishlist(variantId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to save items to your wishlist.");
  const supabase = await createClient();

  let { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  if (!wishlist) {
    const { data: created, error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, name: "My Wishlist", is_default: true })
      .select("id")
      .single();
    if (error) throw error;
    wishlist = created;
  }

  await supabase
    .from("wishlist_items")
    .upsert({ wishlist_id: wishlist.id, variant_id: variantId }, { onConflict: "wishlist_id,variant_id" });

  revalidatePath("/account/wishlist");
}

const profileSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

export type ProfileActionState = { error: string | null } | null;

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone ?? null })
    .eq("id", user.id);

  if (error) return { error: "Could not update profile." };

  revalidatePath("/account/settings");
  return { error: null };
}

const returnRequestSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export type ReturnRequestState = { error: string | null } | null;

export async function requestReturn(
  _prevState: ReturnRequestState,
  formData: FormData,
): Promise<ReturnRequestState> {
  const user = await requireUser();

  const parsed = returnRequestSchema.safeParse({
    orderId: formData.get("orderId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid return request." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("returns").insert({
    order_id: parsed.data.orderId,
    user_id: user.id,
    reason: parsed.data.reason,
  });

  if (error) return { error: "Could not submit return request." };

  revalidatePath("/account/returns");
  return { error: null };
}
