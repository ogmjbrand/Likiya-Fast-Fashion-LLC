import "server-only";

import { stripeGateway } from "./stripe";
import { paystackGateway } from "./paystack";
import { flutterwaveGateway } from "./flutterwave";
import type { PaymentGateway, PaymentProviderId } from "./types";

export * from "./types";
export * from "./fulfillment";

export const paymentGateways: Record<PaymentProviderId, PaymentGateway> = {
  stripe: stripeGateway,
  paystack: paystackGateway,
  flutterwave: flutterwaveGateway,
};

export function getPaymentGateway(provider: PaymentProviderId): PaymentGateway {
  return paymentGateways[provider];
}
