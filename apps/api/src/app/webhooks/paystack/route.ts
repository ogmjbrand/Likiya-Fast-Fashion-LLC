import { NextResponse, type NextRequest } from "next/server";

import { getPaymentGateway, fulfillOrderPayment } from "@likiya/payments";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    const payment = await getPaymentGateway("paystack").handleWebhook(rawBody, request.headers);
    if (payment) await fulfillOrderPayment(payment);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhooks/paystack] Failed to process webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
