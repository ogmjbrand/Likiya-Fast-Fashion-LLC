import "server-only";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@likiya/config/server";
import type { CreateCheckoutSessionInput, PaymentGateway, VerifiedPayment } from "./types";

const FLUTTERWAVE_API_BASE = "https://api.flutterwave.com/v3";

interface FlutterwaveInitializeResponse {
  status: string;
  message: string;
  data: { link: string };
}

interface FlutterwaveWebhookEvent {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: "successful" | "failed";
    meta?: { orderReference?: string };
  };
}

function requireSecretKey(): string {
  if (!serverEnv.FLUTTERWAVE_SECRET_KEY) {
    throw new Error("FLUTTERWAVE_SECRET_KEY is not configured.");
  }
  return serverEnv.FLUTTERWAVE_SECRET_KEY;
}

export const flutterwaveGateway: PaymentGateway = {
  provider: "flutterwave",

  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    const secretKey = requireSecretKey();

    const response = await fetch(`${FLUTTERWAVE_API_BASE}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: input.orderReference,
        amount: input.amount,
        currency: input.currency.toUpperCase(),
        redirect_url: input.successUrl,
        customer: { email: input.customerEmail },
        meta: { orderReference: input.orderReference, ...input.metadata },
      }),
    });

    const body = (await response.json()) as FlutterwaveInitializeResponse;
    if (!response.ok || body.status !== "success") {
      throw new Error(`Flutterwave initialization failed: ${body.message ?? response.statusText}`);
    }

    return {
      provider: "flutterwave",
      redirectUrl: body.data.link,
      providerReference: input.orderReference,
    };
  },

  async handleWebhook(rawBody: string, headers: Headers): Promise<VerifiedPayment | null> {
    if (!serverEnv.FLUTTERWAVE_WEBHOOK_SECRET) {
      throw new Error("FLUTTERWAVE_WEBHOOK_SECRET is not configured.");
    }
    const signature = headers.get("verif-hash");
    if (!signature) throw new Error("Missing verif-hash header.");

    // Flutterwave webhooks are authenticated with a static shared secret
    // (configured in the dashboard) echoed back verbatim, not an HMAC of
    // the body — so this is a constant-time string comparison.
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(serverEnv.FLUTTERWAVE_WEBHOOK_SECRET);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new Error("Invalid Flutterwave webhook signature.");
    }

    const event = JSON.parse(rawBody) as FlutterwaveWebhookEvent;
    if (event.event !== "charge.completed") return null;

    const orderReference = event.data.meta?.orderReference ?? event.data.tx_ref;

    return {
      provider: "flutterwave",
      providerReference: event.data.flw_ref,
      orderReference,
      status: event.data.status === "successful" ? "succeeded" : "failed",
      amount: event.data.amount,
      currency: event.data.currency,
      raw: event,
    };
  },
};
