import "server-only";
import { z } from "zod";

/**
 * Server-only secrets. Importing this file from a client component is a
 * build-time error thanks to the `server-only` package.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1).optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().min(1).optional(),
  FLUTTERWAVE_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  CRON_SECRET: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`,
    );
  }
  return parsed.data;
}

export const serverEnv = loadServerEnv();
