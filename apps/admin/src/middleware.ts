import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@likiya/auth/middleware";

// No third-party scripts run in the admin app, but 'unsafe-inline' is still
// needed: next-themes injects a small inline bootstrap script (sets the
// theme class before first paint, to avoid a flash of the wrong theme) that
// a strict 'self'-only script-src silently blocks — confirmed live via a
// CSP violation on the deployed /login page, not just a theoretical gap.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  // Admin is an internal tool — never index it.
  "X-Robots-Tag": "noindex, nofollow",
};

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request, {
    // Everything except /login requires a staff/admin/super_admin role.
    staffOnlyPrefixes: ["/"],
    authPrefixes: ["/login"],
    authenticatedRedirect: "/",
    unauthorizedRedirect: "/login?error=unauthorized",
  });
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|gif)$).*)",
  ],
};
