"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  signInWithPassword as signInWithPasswordOp,
  signUpWithPassword as signUpWithPasswordOp,
  getOAuthRedirectUrl,
  requestPasswordReset as requestPasswordResetOp,
  updatePassword as updatePasswordOp,
  signOut as signOutOp,
} from "@likiya/auth/server";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@likiya/auth";
import { clientEnv } from "@likiya/config";

export type AuthActionState = { error: string | null } | null;

export async function signInWithPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await signInWithPasswordOp(parsed.data.email, parsed.data.password);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  redirect((formData.get("redirect") as string) || "/account");
}

export async function signUpWithPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await signUpWithPasswordOp(
    parsed.data.email,
    parsed.data.password,
    parsed.data.fullName,
    `${clientEnv.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
  );

  if (error) {
    return { error: error.message };
  }

  redirect("/register/check-email");
}

export async function signInWithOAuth(provider: "google" | "apple") {
  const { data, error } = await getOAuthRedirectUrl({
    provider,
    redirectTo: `${clientEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await requestPasswordResetOp(
    parsed.data.email,
    `${clientEnv.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account/settings/password`,
  );

  // Always succeed from the caller's perspective to avoid leaking which
  // emails have accounts.
  return { error: null };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await updatePasswordOp(parsed.data.password);

  if (error) {
    return { error: error.message };
  }

  redirect("/account/settings?passwordUpdated=1");
}

export async function signOut() {
  await signOutOp();
  revalidatePath("/", "layout");
  redirect("/");
}
