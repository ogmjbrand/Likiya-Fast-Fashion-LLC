import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

import { serverEnv } from "@likiya/config/server";
import type { CreateCheckoutSessionInput, PaymentGateway, VerifiedPayment } from "./types";

const PAYSTACK_API_BASE = "https://api.paystack.co";

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: { authorization_url: string; access_code: string; reference: string };
}

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    status: "success" | "failed" | "abandoned";
    amount: number;
    currency: string;
    metadata?: { orderReference?: string };
  };
}

function requireSecretKey(): string {
  if (!serverEnv.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }
  return serverEnv.PAYSTACK_SECRET_KEY;
}

export const paystackGateway: PaymentGateway = {
  provider: "paystack",

  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    const secretKey = requireSecretKey();

    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.customerEmail,
        amount: Math.round(input.amount * 100), // Paystack expects the smallest currency unit (kobo/cents)
        currency: input.currency.toUpperCase(),
        reference: input.orderReference,
        callback_url: input.successUrl,
        metadata: { orderReference: input.orderReference, ...input.metadata },
      }),
    });

    const body = (await response.json()) as PaystackInitializeResponse;
    if (!response.ok || !body.status) {
      throw new Error(`Paystack initialization failed: ${body.message ?? response.statusText}`);
    }

    return {
      provider: "paystack",
      redirectUrl: body.data.authorization_url,
      providerReference: body.data.reference,
    };
  },

  async handleWebhook(rawBody: string, headers: Headers): Promise<VerifiedPayment | null> {
    const secretKey = requireSecretKey();
    const signature = headers.get("x-paystack-signature");
    if (!signature) throw new Error("Missing x-paystack-signature header.");

    const expected = createHmac("sha512", secretKey).update(rawBody).digest("hex");
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new Error("Invalid Paystack webhook signature.");
    }

    const event = JSON.parse(rawBody) as PaystackWebhookEvent;
    if (event.event !== "charge.success" && event.event !== "charge.failed") return null;

    const orderReference = event.data.metadata?.orderReference ?? event.data.reference;

    return {
      provider: "paystack",
      providerReference: event.data.reference,
      orderReference,
      status: event.event === "charge.success" && event.data.status === "success" ? "succeeded" : "failed",
      amount: event.data.amount / 100,
      currency: event.data.currency,
      raw: event,
    };
  },
};
