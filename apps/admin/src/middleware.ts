import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@likiya/auth/middleware";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
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
