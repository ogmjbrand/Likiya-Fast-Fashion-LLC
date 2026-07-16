"use client";

import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@likiya/config";
import type { Database } from "./types";

/** Browser-side Supabase client. Safe to call repeatedly — cheap to construct. */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
