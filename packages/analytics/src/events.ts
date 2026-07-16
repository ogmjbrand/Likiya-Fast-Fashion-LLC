"use client";

/**
 * GA4 event helpers following the standard ecommerce event schema
 * (https://developers.google.com/analytics/devguides/collection/ga4/ecommerce).
 * No-ops safely if GA hasn't loaded (dev, ad-blockers, GA not configured).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
}

function pushEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...params });
}

export const analyticsEvents = {
  viewItem: (item: GA4Item, currency = "USD") =>
    pushEvent("view_item", { currency, value: item.price, items: [item] }),

  addToCart: (item: GA4Item, currency = "USD") =>
    pushEvent("add_to_cart", {
      currency,
      value: item.price * (item.quantity ?? 1),
      items: [item],
    }),

  removeFromCart: (item: GA4Item, currency = "USD") =>
    pushEvent("remove_from_cart", {
      currency,
      value: item.price * (item.quantity ?? 1),
      items: [item],
    }),

  beginCheckout: (items: GA4Item[], value: number, currency = "USD") =>
    pushEvent("begin_checkout", { currency, value, items }),

  addShippingInfo: (items: GA4Item[], value: number, currency = "USD") =>
    pushEvent("add_shipping_info", { currency, value, items }),

  addPaymentInfo: (items: GA4Item[], value: number, currency = "USD") =>
    pushEvent("add_payment_info", { currency, value, items }),

  purchase: (
    transactionId: string,
    items: GA4Item[],
    value: number,
    currency = "USD",
    shipping = 0,
    tax = 0,
  ) =>
    pushEvent("purchase", {
      transaction_id: transactionId,
      currency,
      value,
      shipping,
      tax,
      items,
    }),

  search: (searchTerm: string) => pushEvent("search", { search_term: searchTerm }),
};
