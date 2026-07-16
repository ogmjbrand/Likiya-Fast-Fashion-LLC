import "server-only";

import { createClient } from "@likiya/database/server";
import type {
  Address,
  Order,
  OrderItem,
  WishlistItem,
  ProductVariant,
  Product,
  ProductImage,
  ReturnRequest,
} from "@likiya/database";

export async function getMyOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export async function getMyOrderDetail(userId: string, orderId: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as OrderDetail | null;
}

export async function getMyAddresses(userId: string): Promise<Address[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export interface WishlistItemWithProduct extends WishlistItem {
  variant: ProductVariant & { product: Product; images: ProductImage[] };
}

export async function getMyWishlist(userId: string): Promise<WishlistItemWithProduct[]> {
  const supabase = await createClient();

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (!wishlist) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*, variant:product_variants(*, product:products(*), images:product_images(*))")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as WishlistItemWithProduct[];
}

export interface MyReturnRow extends ReturnRequest {
  order: { order_number: string } | null;
}

export async function getMyReturns(userId: string): Promise<MyReturnRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("returns")
    .select("*, order:orders(order_number)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as MyReturnRow[];
}
