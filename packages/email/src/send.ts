import "server-only";

import { sendEmail } from "./client";
import { orderConfirmationEmail, type OrderConfirmationInput } from "./templates/order-confirmation";
import { orderShippedEmail, type OrderShippedInput } from "./templates/order-shipped";
import { welcomeEmail, type WelcomeEmailInput } from "./templates/welcome";

export async function sendOrderConfirmationEmail(to: string, input: OrderConfirmationInput) {
  const { subject, html } = orderConfirmationEmail(input);
  return sendEmail({ to, subject, html });
}

export async function sendOrderShippedEmail(to: string, input: OrderShippedInput) {
  const { subject, html } = orderShippedEmail(input);
  return sendEmail({ to, subject, html });
}

export async function sendWelcomeEmail(to: string, input: WelcomeEmailInput) {
  const { subject, html } = welcomeEmail(input);
  return sendEmail({ to, subject, html });
}
