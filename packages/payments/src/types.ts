export type PaymentProviderId = "stripe" | "paystack" | "flutterwave";

export interface CheckoutLineItem {
  name: string;
  quantity: number;
  /** Major currency units (e.g. dollars, not cents) — each adapter converts as its API requires. */
  unitAmount: number;
}

export interface CreateCheckoutSessionInput {
  /** Our internal order id/number — always round-tripped via metadata/tx_ref so the webhook can find the order. */
  orderReference: string;
  amount: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  lineItems: CheckoutLineItem[];
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  provider: PaymentProviderId;
  /** URL to redirect the customer to in order to complete payment. */
  redirectUrl: string;
  /** Provider-side identifier for this payment attempt (session id / reference / tx_ref). */
  providerReference: string;
}

export interface VerifiedPayment {
  provider: PaymentProviderId;
  providerReference: string;
  orderReference: string;
  status: "succeeded" | "failed" | "pending";
  amount: number;
  currency: string;
  raw: unknown;
}

export interface PaymentGateway {
  provider: PaymentProviderId;
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession>;
  /** Verifies an inbound webhook request and returns the normalized payment result. */
  handleWebhook(rawBody: string, headers: Headers): Promise<VerifiedPayment | null>;
}
