import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { clientEnv } from "@likiya/config";
import type { Database } from "./types";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Reads the caller's session from cookies — RLS applies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no response to write to —
            // safe to ignore because middleware refreshes the session too.
          }
        },
      },
    },
  );
}
