import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { clientEnv } from "@likiya/config";

export interface SessionUpdateOptions {
  /** Prefixes that require any authenticated user (e.g. `/account`). */
  protectedPrefixes?: string[];
  /** Prefixes that require `profiles.role` in staff/admin/super_admin (e.g. the whole admin app). */
  staffOnlyPrefixes?: string[];
  /** Prefixes to redirect *away from* once the visitor is already logged in (e.g. `/login`). */
  authPrefixes?: string[];
  /** Where unauthenticated visitors hitting a protected/staff-only route are sent. */
  loginPath?: string;
  /** Where an already-authenticated visitor hitting an auth page is sent. */
  authenticatedRedirect?: string;
  /** Where a logged-in but non-staff visitor hitting a staff-only route is sent. */
  unauthorizedRedirect?: string;
}

/**
 * Refreshes the Supabase session cookie on every request and enforces
 * coarse route protection shared by every app. Fine-grained RBAC still
 * happens per-page via the RLS-backed `profiles.role` lookup — this is a
 * fast, cookie-only first line of defense so unauthenticated/unauthorized
 * requests never render a protected page's server components at all.
 */
export async function updateSession(request: NextRequest, options: SessionUpdateOptions = {}) {
  const {
    protectedPrefixes = [],
    staffOnlyPrefixes = [],
    authPrefixes = [],
    loginPath = "/login",
    authenticatedRedirect = "/",
    unauthorizedRedirect = "/",
  } = options;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options: cookieOptions } of cookiesToSet) {
            response.cookies.set(name, value, cookieOptions);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthPage = authPrefixes.some((p) => pathname.startsWith(p));
  // Auth pages (/login, /register, ...) are never themselves protected —
  // otherwise an unauthenticated visit to /login would redirect to /login,
  // matching the same rule again on the next request.
  const isProtected = !isAuthPage && protectedPrefixes.some((p) => pathname.startsWith(p));
  const isStaffOnly = !isAuthPage && staffOnlyPrefixes.some((p) => pathname.startsWith(p));

  if ((isProtected || isStaffOnly) && !user) {
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isStaffOnly && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["staff", "admin", "super_admin"].includes(profile.role)) {
      return NextResponse.redirect(new URL(unauthorizedRedirect, request.url));
    }
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL(authenticatedRedirect, request.url));
  }

  return response;
}
