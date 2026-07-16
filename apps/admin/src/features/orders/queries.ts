import "server-only";

import { createClient } from "@likiya/database/server";
import type { Order, OrderItem, Payment } from "@likiya/database";

export interface AdminOrderDetail extends Order {
  items: OrderItem[];
  payments: Payment[];
}

export async function getAdminOrderList(page = 1, pageSize = 20) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("orders")
    .select("id, order_number, guest_email, status, fulfillment_status, total, currency, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    orders: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function getAdminOrderDetail(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), payments(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  return order as unknown as AdminOrderDetail | null;
}
