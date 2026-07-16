# Architecture

## Why a monorepo

The storefront, admin dashboard, and payment webhooks have different
security postures, different scaling profiles, and different deploy
cadences:

- **storefront** is public, needs to be fast (SSR/ISR, edge-cacheable), and
  changes constantly (marketing, catalog, checkout copy).
- **admin** is internal, gated by staff RBAC, and can tolerate a slower
  release cadence — but a bug here shouldn't be able to take down checkout.
- **api** just needs to answer webhook POSTs correctly and quickly; it has
  no UI and doesn't need Tailwind, shadcn, or a browser bundle at all.

Deploying them as three separate Vercel projects means a storefront traffic
spike doesn't affect admin, an admin RBAC bug can't leak into the public
site's bundle, and the webhook handler's cold-start path doesn't carry any
UI framework weight.

The alternative — one Next.js app with `/admin` and `/api` route groups
inside it — is simpler on day one, but couples all three concerns to one
deploy, one bundle, and one scaling profile. Given the platform's own
roadmap (multi-warehouse, multi-region, eventually multi-brand/marketplace —
see `ROADMAP.md`), that coupling gets more expensive to unwind the longer
it's deferred. Splitting now, while the codebase is small, is mechanical;
splitting after six months of organic growth usually isn't.

## Package boundaries

Each `packages/*` is a real workspace package (`@likiya/*`), not just a
folder alias — it has its own `package.json`, and other packages/apps
declare it as a dependency. That's a deliberate constraint, not
bureaucracy: it's what makes `pnpm why @likiya/database` meaningful, keeps
circular dependencies from creeping in unnoticed, and means each package
can eventually be versioned or extracted independently if this ever becomes
a multi-repo setup.

**Client/server boundaries inside a package.** Several packages export a
client-safe surface from their main entry point and a server-only surface
from a `/server` subpath (`@likiya/auth` vs. `@likiya/auth/server`,
`@likiya/config` vs. `@likiya/config/server`). This isn't stylistic — the
`server-only` package throws at build time if server code leaks into a
client bundle, and subpath exports are what let a barrel file re-export
"the client-safe half" without accidentally pulling in `next/headers` or a
service-role key. When you add something to one of these packages, ask
which side of that line it belongs on before reaching for the nearest
`index.ts`.

**Where business logic lives.** `packages/*` hold primitives and
infrastructure: Supabase client factories, the design system, payment
gateway adapters, email templates. `apps/*/src/features/*` hold
composition — the actual "when a customer checks out, do X then Y then Z"
logic — because that logic is app-specific (the storefront's checkout flow
and the admin's order-management flow are different call sites, even though
both eventually touch the same `orders` table via `@likiya/database`).

## Request flow: checkout → fulfillment

This is the most cross-cutting flow in the codebase, so it's worth tracing
end to end:

1. **Storefront** (`apps/storefront/src/features/checkout/actions.ts`):
   the cart lives client-side (Zustand, persisted to `localStorage` — see
   "Why the cart is client-side" below). On submit, a Server Action
   re-fetches every variant's *live* price from `product_variants` (never
   trusts the price the client sent), creates the `orders` +
   `order_items` rows with status `awaiting_payment`, then calls
   `@likiya/payments`'s `getPaymentGateway(provider).createCheckoutSession()`
   and redirects the browser to the provider's hosted checkout page.
2. **Provider** (Stripe/Paystack/Flutterwave) hosts the actual payment UI —
   card fields never touch our servers.
3. **apps/api** receives the provider's webhook, verifies its signature
   (HMAC for Stripe/Paystack, shared-secret header for Flutterwave — see
   `packages/payments/src/{stripe,paystack,flutterwave}.ts`), and calls
   `fulfillOrderPayment()` in `packages/payments/src/fulfillment.ts`. That
   function is the single place that: records the payment (idempotently —
   webhooks can and do redeliver), decrements inventory via
   `packages/inventory`'s `adjustInventory()`, flips the order to
   `processing`, and sends the confirmation email via `@likiya/email`.
4. **Storefront** success page reads the order back out by `order_number`
   and clears the local cart.

Every gateway drives the same fulfillment function, so adding a fourth
provider means implementing `PaymentGateway` (in
`packages/payments/src/types.ts`) — not re-deriving the order lifecycle.

### Why the cart is client-side

The cart is a Zustand store persisted to `localStorage`, not a `carts`
table row synced on every add-to-cart click. That's a real trade-off, not
an oversight: it means zero latency on cart interactions and no
guest-cart-cleanup cron job, at the cost of carts not syncing across
devices and not surviving a cleared browser profile. The `carts`/`cart_items`
tables already exist in the schema for the day this trade-off stops being
worth it (see `ROADMAP.md`).

## Security model

- **RLS is the source of truth**, not app-layer checks. Every table has
  Row Level Security policies (`supabase/migrations/*_rls.sql`) built
  around a `public.is_staff()` / `public.is_admin()` pair of
  `SECURITY DEFINER` functions that read `profiles.role`. The middleware
  route-gating (`packages/auth/src/middleware.ts`) is a fast first line of
  defense so an unauthorized request never even renders a protected page's
  Server Components — but if a policy and a page check ever disagree,
  the database wins.
- **Never trust client input for money.** The checkout action re-prices
  from `product_variants`; the fulfillment path re-derives amounts from
  the provider's webhook payload, not from what the client displayed.
- **Server actions get CSRF protection for free** from Next.js (it checks
  the `Origin` header against the deployment's own origin). Webhook routes
  authenticate via provider signatures instead, since they're
  cross-origin by design.

## Performance choices

- Server Components by default; the storefront's data-fetching
  (`features/products/queries.ts`) runs entirely on the server so the
  client bundle stays small.
- `revalidate` on catalog pages (homepage, PDP, PLP) rather than
  request-time fetching on every hit — tune per page based on how often
  that data actually changes.
- `next/image` with `remotePatterns` scoped to Supabase Storage and the
  seed data's Unsplash source; swap in your own CDN domain in
  `next.config.ts` when you load real product photography.
- `transpilePackages` + `outputFileTracingRoot` in every app's
  `next.config.ts` are what let Next.js compile the workspace packages'
  raw TypeScript source directly, instead of requiring a build step per
  package before the app can consume it.
