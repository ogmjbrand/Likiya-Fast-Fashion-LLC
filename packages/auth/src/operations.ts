import "server-only";

import { createClient } from "@likiya/database/server";

/**
 * Low-level auth operations shared by every app (storefront, admin). These
 * intentionally do NOT call `redirect()` or `revalidatePath()` — those are
 * Next.js Server Action side effects that differ per app (e.g. storefront
 * sends customers to /account, admin sends staff to /admin). Each app wraps
 * these in its own thin Server Action with its own redirect targets.
 */

export interface OAuthOptions {
  provider: "google" | "apple";
  redirectTo: string;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string,
  emailRedirectTo: string,
) {
  const supabase = await createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo,
    },
  });
}

export async function getOAuthRedirectUrl({ provider, redirectTo }: OAuthOptions) {
  const supabase = await createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const supabase = await createClient();
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  return supabase.auth.updateUser({ password });
}

export async function signOut() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}

export async function exchangeCodeForSession(code: string) {
  const supabase = await createClient();
  return supabase.auth.exchangeCodeForSession(code);
}

export async function verifyOtp(params: Parameters<Awaited<ReturnType<typeof createClient>>["auth"]["verifyOtp"]>[0]) {
  const supabase = await createClient();
  return supabase.auth.verifyOtp(params);
}
