import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@likiya/auth/middleware";
import { checkRateLimit } from "@likiya/utils/rate-limit";

const RATE_LIMITED_PREFIXES = ["/api/checkout", "/api/cart", "/api/newsletter", "/api/reviews"];

/**
 * `'unsafe-inline'` on script-src is a deliberate compromise: GA4/Clarity's
 * official snippets are inline, and a nonce-based CSP would force every
 * page in the app to opt out of static rendering (the nonce has to be
 * generated per-request and threaded through `headers()` in the root
 * layout). Everything else here is strict — this still blocks framing,
 * arbitrary form targets, and object/plugin embeds.
 *
 * `'unsafe-eval'` is added in development only: `next dev`'s HMR client
 * runtime evaluates code via `eval()`, which a strict CSP otherwise blocks —
 * that doesn't just log a warning, it silently breaks hydration (every
 * client component stays stuck at its pre-hydration `initial` state, e.g.
 * scroll-reveal animations never firing). Production builds don't use
 * eval() at all, so this never loosens the deployed policy.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.clarity.ms https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://checkout.paystack.com https://checkout.flutterwave.com",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
};

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
