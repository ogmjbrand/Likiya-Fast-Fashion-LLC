import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@likiya/auth/middleware";
import { checkRateLimit } from "@likiya/utils/rate-limit";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

const RATE_LIMITED_PREFIXES = ["/api/checkout", "/api/cart", "/api/newsletter", "/api/reviews"];

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RATE_LIMITED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const identifier =
      request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous";
    const { success, limit, remaining, reset } = await checkRateLimit(identifier);

    if (!success) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: "Too many requests. Please try again shortly." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": String(reset),
            },
          },
        ),
      );
    }
  }

  const response = await updateSession(request, {
    protectedPrefixes: ["/account"],
    authPrefixes: ["/login", "/register", "/forgot-password"],
    authenticatedRedirect: "/account",
  });
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and image optimization files,
     * so the Supabase session cookie stays fresh across the whole app.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|gif)$).*)",
  ],
};
