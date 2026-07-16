"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@likiya/database/server";
import { logActivity } from "@likiya/database/activity-log";
import { requireStaff } from "@likiya/auth/server";
import type { OrderStatus, FulfillmentStatus } from "@likiya/database";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;

  await logActivity(supabase, {
    actorId: staff.id,
    action: "order.status_changed",
    entityType: "order",
    entityId: orderId,
    metadata: { status },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

export async function updateFulfillmentStatus(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus,
  tracking?: { number: string; url: string; carrier: string },
) {
  const staff = await requireStaff();
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

  await logActivity(supabase, {
    actorId: staff.id,
    action: "order.fulfillment_changed",
    entityType: "order",
    entityId: orderId,
    metadata: { fulfillmentStatus },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}
