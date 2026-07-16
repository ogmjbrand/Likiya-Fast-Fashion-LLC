# Environment Variables

Every variable is validated at startup by `packages/config` (zod schemas in
`env.ts` for `NEXT_PUBLIC_*` client vars, `env.server.ts` for secrets) — a
missing or malformed required variable fails the build/boot with a clear
error rather than an obscure `undefined` bug three requests later.

Each app has its own `.env.example` — copy it to `.env.local` for local dev
and set the real values in your Vercel project settings for deployed
environments. Variables marked **required** cause a startup error if
missing; everything else degrades gracefully (a feature no-ops or a
payment provider is unavailable) rather than crashing.

## Shared across all three apps

Because one Supabase project backs storefront, admin, and api, these three
are identical across all three apps' environments:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Safe to expose to the browser — RLS is what actually protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin/api; optional for storefront | Bypasses RLS entirely. Never expose to the browser. Storefront only needs it for the checkout-success guest order lookup (see `docs/DATABASE.md`) |

## `apps/storefront`

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ | This app's own deployed URL — used for OAuth redirects, email links, canonical URLs, sitemap |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For Stripe | Only needed if you later add Stripe Elements/Payment Element client-side; the current hosted-checkout flow doesn't require it |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Omit to skip loading GA4 entirely |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | No | Omit to skip loading Microsoft Clarity |
| `CRON_SECRET` | No | Only relevant if you add scheduled routes to this app |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | See "Rate limiting" below |

## `apps/admin`

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ | The admin app's own URL |
| `NEXT_PUBLIC_STOREFRONT_URL` | No | Used to link out to the storefront from order/customer detail pages |

## `apps/api`

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ | This app's own URL |
| `NEXT_PUBLIC_STOREFRONT_URL` | Recommended | Order confirmation emails link back to `{STOREFRONT_URL}/account/orders/{id}` — without it they fall back to this app's own URL, which is wrong |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | For Stripe | |
| `PAYSTACK_SECRET_KEY` | For Paystack | Also used to verify webhook signatures — Paystack has no separate webhook secret |
| `PAYSTACK_WEBHOOK_SECRET` | Unused | Reserved; Paystack doesn't issue one today (see above) |
| `FLUTTERWAVE_SECRET_KEY` | For Flutterwave | |
| `FLUTTERWAVE_WEBHOOK_SECRET` | For Flutterwave | The **Secret Hash** you set in the Flutterwave dashboard, not a value they generate |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | No | Order confirmation/shipped emails no-op with a console warning if unset |
| `CRON_SECRET` | For the low-stock digest cron | Compared against the cron request's `Authorization: Bearer` header |

## Rate limiting

`packages/utils/src/rate-limit.ts` ships an in-memory sliding-window
limiter — correct for local dev and a single-instance deployment, but it
resets per-instance on Vercel's multi-region/multi-lambda edge, so it's not
a real limit under load. Set `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` and swap the body of `checkRateLimit()` for an
`@upstash/ratelimit` call before relying on this in production — the call
signature (`{ success, limit, remaining, reset }`) is designed to stay the
same so `apps/storefront/src/middleware.ts` doesn't need to change.
