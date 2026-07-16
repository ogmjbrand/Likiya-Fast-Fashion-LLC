import "server-only";
import { Resend } from "resend";

import { serverEnv } from "@likiya/config/server";

let cachedClient: Resend | null = null;

/** Lazily constructs the Resend client; returns null when RESEND_API_KEY isn't configured. */
export function getResendClient(): Resend | null {
  if (!serverEnv.RESEND_API_KEY) return null;
  cachedClient ??= new Resend(serverEnv.RESEND_API_KEY);
  return cachedClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email. Silently no-ops (with a console warning)
 * when Resend isn't configured, so local/dev environments without a
 * RESEND_API_KEY don't crash the checkout/notification flow that triggers
 * the send — email delivery is a side effect, not a hard dependency of the
 * order/account operation itself.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not configured — skipped "${subject}" to ${to}`);
    return { skipped: true as const };
  }

  const from = serverEnv.RESEND_FROM_EMAIL ?? "orders@likiya.com";
  const { data, error } = await resend.emails.send({ from, to, subject, html });

  if (error) throw new Error(`Failed to send email: ${error.message}`);
  return { skipped: false as const, id: data?.id };
}
