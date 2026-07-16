import { NextResponse, type NextRequest } from "next/server";

import { getPaymentGateway, fulfillOrderPayment } from "@likiya/payments";

/** Stripe requires the raw request body (not JSON-parsed) to verify the signature. */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    const payment = await getPaymentGateway("stripe").handleWebhook(rawBody, request.headers);
    if (payment) await fulfillOrderPayment(payment);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhooks/stripe] Failed to process webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
