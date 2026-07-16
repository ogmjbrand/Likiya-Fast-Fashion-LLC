import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { clientEnv } from "@likiya/config";
import { serverEnv } from "@likiya/config/server";
import type { Database } from "./types";

/**
 * Service-role Supabase client. Bypasses RLS entirely — use only in trusted
 * server contexts (webhooks, cron jobs, admin server actions that have
 * already authorized the caller). Never expose this client or its key to
 * the browser.
 */
export function createAdminClient() {
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
