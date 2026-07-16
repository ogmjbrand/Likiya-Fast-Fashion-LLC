import "server-only";
import Stripe from "stripe";

import { serverEnv } from "@likiya/config/server";
import type { CreateCheckoutSessionInput, PaymentGateway, VerifiedPayment } from "./types";

let cachedClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!serverEnv.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  cachedClient ??= new Stripe(serverEnv.STRIPE_SECRET_KEY);
  return cachedClient;
}

export const stripeGateway: PaymentGateway = {
  provider: "stripe",

  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      line_items: input.lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: Math.round(item.unitAmount * 100),
          product_data: { name: item.name },
        },
      })),
      metadata: { orderReference: input.orderReference, ...input.metadata },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");

    return {
      provider: "stripe",
      redirectUrl: session.url,
      providerReference: session.id,
    };
  },

  async handleWebhook(rawBody: string, headers: Headers): Promise<VerifiedPayment | null> {
    if (!serverEnv.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    }
    const signature = headers.get("stripe-signature");
    if (!signature) throw new Error("Missing stripe-signature header.");

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(rawBody, signature, serverEnv.STRIPE_WEBHOOK_SECRET);

    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_failed") {
      return null;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const orderReference = session.metadata?.orderReference;
    if (!orderReference) return null;

    return {
      provider: "stripe",
      providerReference: session.id,
      orderReference,
      status: event.type === "checkout.session.completed" && session.payment_status === "paid" ? "succeeded" : "failed",
      amount: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? "usd").toUpperCase(),
      raw: event,
    };
  },
};
