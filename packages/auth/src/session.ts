import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@likiya/database/server";
import type { Profile } from "@likiya/database";

/** Cached per-request: safe to call from multiple layouts/pages without refetching. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return data as Profile | null;
});

export async function requireUser(loginPath = "/login") {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath);
  return user;
}

export async function requireStaff(fallbackPath = "/") {
  const profile = await getCurrentProfile();
  if (!profile || !["staff", "admin", "super_admin"].includes(profile.role)) {
    redirect(fallbackPath);
  }
  return profile;
}

export async function requireAdmin(fallbackPath = "/") {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect(fallbackPath);
  }
  return profile;
}
