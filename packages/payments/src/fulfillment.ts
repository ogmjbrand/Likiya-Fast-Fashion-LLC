import "server-only";

import { createAdminClient } from "@likiya/database/admin";
import { adjustInventory } from "@likiya/inventory";
import { sendOrderConfirmationEmail } from "@likiya/email";
import { formatPrice } from "@likiya/utils";
import { clientEnv } from "@likiya/config";
import type { Order, OrderItem } from "@likiya/database";
import type { VerifiedPayment } from "./types";

const DEFAULT_WAREHOUSE_CODE = "MAIN";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Single source of truth for "a payment gateway just told us this order was
 * paid (or failed)". Called from every provider's webhook route so Stripe,
 * Paystack, and Flutterwave all drive the same order lifecycle: record the
 * payment, decrement inventory, flip the order to `processing`, and email
 * the customer — instead of each webhook re-implementing this by hand.
 */
export async function fulfillOrderPayment(payment: VerifiedPayment) {
  const supabase = createAdminClient();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("order_number", payment.orderReference)
    .maybeSingle();

  if (orderError) throw orderError;
  const order = orderData as unknown as OrderWithItems | null;
  if (!order) {
    console.error(`[fulfillment] No order found for reference ${payment.orderReference}`);
    return;
  }

  // Idempotency: webhooks can retry/duplicate-deliver. If we've already
  // recorded this provider reference, don't double-charge inventory.
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("provider", payment.provider)
    .eq("provider_reference", payment.providerReference)
    .maybeSingle();

  if (existingPayment) return;

  await supabase.from("payments").insert({
    order_id: order.id,
    provider: payment.provider,
    provider_reference: payment.providerReference,
    status: payment.status === "succeeded" ? "succeeded" : "failed",
    amount: payment.amount,
    currency: payment.currency,
    raw_response: payment.raw as Record<string, unknown>,
  });

  if (payment.status !== "succeeded") {
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return;
  }

  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("code", DEFAULT_WAREHOUSE_CODE)
    .maybeSingle();

  if (warehouse) {
    for (const item of order.items) {
      if (!item.variant_id) continue;
      await adjustInventory(supabase, {
        variantId: item.variant_id,
        warehouseId: warehouse.id,
        quantityDelta: -item.quantity,
        reason: "sale",
        referenceType: "order",
        referenceId: order.id,
      });
    }
  }

  await supabase
    .from("orders")
    .update({ status: "processing", placed_at: new Date().toISOString() })
    .eq("id", order.id);

  let customerEmail = order.guest_email;
  if (!customerEmail && order.user_id) {
    const { data: userResult } = await supabase.auth.admin.getUserById(order.user_id);
    customerEmail = userResult.user?.email ?? null;
  }

  if (customerEmail) {
    await sendOrderConfirmationEmail(customerEmail, {
      siteName: "Likiya",
      siteUrl: clientEnv.NEXT_PUBLIC_STOREFRONT_URL ?? clientEnv.NEXT_PUBLIC_SITE_URL,
      orderNumber: order.order_number,
      customerName: (order.shipping_address as { full_name?: string } | null)?.full_name ?? "there",
      items: order.items.map((item) => ({
        name: item.product_name,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        total: formatPrice(item.total, order.currency),
      })),
      subtotal: formatPrice(order.subtotal, order.currency),
      shipping: formatPrice(order.shipping_total, order.currency),
      tax: formatPrice(order.tax_total, order.currency),
      total: formatPrice(order.total, order.currency),
      orderUrl: `${clientEnv.NEXT_PUBLIC_STOREFRONT_URL ?? clientEnv.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}`,
    }).catch((err) => console.error("[fulfillment] Failed to send confirmation email", err));
  }
}
