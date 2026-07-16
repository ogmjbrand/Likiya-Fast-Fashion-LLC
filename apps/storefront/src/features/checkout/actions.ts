"use server";

import { redirect } from "next/navigation";

import { createClient } from "@likiya/database/server";
import { getPaymentGateway } from "@likiya/payments";
import { clientEnv } from "@likiya/config";

import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { calculateShipping, calculateTax } from "./pricing";

export type CheckoutActionState = { error: string | null } | null;

export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutActionState> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid checkout details." };
  }

  const { email, shippingAddress, provider, items } = parsed.data;
  const supabase = await createClient();

  // Re-price everything server-side from the live variant/product rows —
  // never trust unit prices or product names sent from the client.
  interface VariantWithProduct {
    id: string;
    sku: string;
    title: string | null;
    price: number;
    is_active: boolean;
    product: { id: string; name: string; slug: string; currency: string };
  }

  const variantIds = items.map((i) => i.variantId);
  const { data: variantsData, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, sku, title, price, is_active, product:products(id, name, slug, currency)")
    .in("id", variantIds);

  if (variantsError) return { error: "Something went wrong. Please try again." };

  const variants = variantsData as unknown as VariantWithProduct[] | null;
  const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));

  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, url, position")
    .in(
      "product_id",
      (variants ?? []).map((v) => v.product.id),
    )
    .order("position", { ascending: true });

  const imageByProduct = new Map<string, string>();
  for (const image of images ?? []) {
    if (!imageByProduct.has(image.product_id)) imageByProduct.set(image.product_id, image.url);
  }

  const orderItems: {
    variant_id: string;
    product_name: string;
    variant_title: string | null;
    sku: string;
    image_url: string | null;
    unit_price: number;
    quantity: number;
    total: number;
  }[] = [];

  let subtotal = 0;
  const currency = variants?.[0]?.product.currency ?? "USD";

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || !variant.is_active) {
      return { error: "One of the items in your bag is no longer available." };
    }
    const lineTotal = variant.price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({
      variant_id: variant.id,
      product_name: variant.product.name,
      variant_title: variant.title,
      sku: variant.sku,
      image_url: imageByProduct.get(variant.product.id) ?? null,
      unit_price: variant.price,
      quantity: item.quantity,
      total: lineTotal,
    });
  }

  const shippingTotal = calculateShipping(subtotal, shippingAddress.countryCode);
  const taxTotal = calculateTax(subtotal, shippingAddress.countryCode);
  const total = subtotal + shippingTotal + taxTotal;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: email,
      status: "awaiting_payment",
      currency,
      subtotal,
      shipping_total: shippingTotal,
      tax_total: taxTotal,
      total,
      shipping_address: {
        full_name: shippingAddress.fullName,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 ?? null,
        city: shippingAddress.city,
        state: shippingAddress.state ?? null,
        postal_code: shippingAddress.postalCode,
        country_code: shippingAddress.countryCode,
        phone: shippingAddress.phone ?? null,
      },
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { error: "Could not create your order. Please try again." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    return { error: "Could not create your order. Please try again." };
  }

  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
  const gateway = getPaymentGateway(provider);

  let session;
  try {
    session = await gateway.createCheckoutSession({
      orderReference: order.order_number,
      amount: total,
      currency,
      customerEmail: email,
      successUrl: `${siteUrl}/checkout/success?order=${order.order_number}`,
      cancelUrl: `${siteUrl}/checkout`,
      lineItems: orderItems.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        unitAmount: item.unit_price,
      })),
    });
  } catch {
    return { error: `${provider} is not configured yet. Please choose another payment method.` };
  }

  redirect(session.redirectUrl);
}
