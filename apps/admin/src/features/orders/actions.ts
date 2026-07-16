"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import type { OrderStatus, FulfillmentStatus } from "@likiya/database";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

export async function updateFulfillmentStatus(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus,
  tracking?: { number: string; url: string; carrier: string },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      fulfillment_status: fulfillmentStatus,
      ...(tracking
        ? { tracking_number: tracking.number, tracking_url: tracking.url, carrier: tracking.carrier }
        : {}),
    })
    .eq("id", orderId);
  if (error) throw error;
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}
