# Roadmap: what's built, what's simplified, what's next

This is Phase 1 of the platform's own stated roadmap (single-brand
e-commerce). Everything listed as "built" below is real and working against
actual Supabase tables — not a mock. Everything listed as "simplified" is a
genuine, working implementation of a narrower version of the feature, with
a clear extension point. Nothing here is a stub that throws
`not implemented`.

## Built

**Storefront**: homepage, category/collection listing with sort, product
detail with variant selection, search (Postgres full-text), cart (client-side,
persisted), guest + authenticated checkout, order confirmation, reviews
(verified-purchase aware), wishlist, account dashboard (orders, addresses,
returns, settings), email/password + Google/Apple OAuth auth.

**Admin**: RBAC-gated dashboard (revenue/orders/low-stock overview), orders
list + detail with status management, products list + detail with
publish/feature controls, customers list, inventory with adjustment
history, coupon management, returns triage, revenue analytics chart, audit
log viewer.

**Payments**: Stripe, Paystack, and Flutterwave — all three are real
integrations (checkout session creation + signature-verified webhooks), not
one real provider and two stubs. A shared `fulfillOrderPayment()` drives
the same order lifecycle regardless of which one a customer used.

**Platform**: full normalized schema with RLS on every table, Supabase auth,
Resend transactional email (order confirmation/shipped/welcome), GA4 +
Clarity analytics with ecommerce event tracking, sitemap/robots/structured
data, security headers + CSP, rate limiting, audit logging, unit + e2e
tests.

## Deliberately simplified (not gaps — see the reasoning inline)

- **Shipping and tax** (`apps/storefront/src/features/checkout/pricing.ts`):
  a flat rate + free-shipping-over-$150 rule, and a flat 8% US sales tax
  with $0 for everywhere else. Real multi-jurisdiction tax and
  carrier-rate shopping needs a dedicated engine (Stripe Tax, TaxJar,
  EasyPost) — swap the two functions in that file for API calls; nothing
  else in the checkout flow needs to change.
- **Cart is client-side** (`localStorage` via Zustand), not synced to the
  `carts`/`cart_items` tables on every interaction. See
  `docs/ARCHITECTURE.md`'s "Why the cart is client-side" for the
  trade-off. The tables already exist for when cross-device cart sync
  becomes worth the added complexity.
- **RBAC is role-based, not permission-based.** `profiles.role` (customer/
  staff/admin/super_admin) is what every policy actually checks. The
  fine-grained `roles`/`permissions`/`role_permissions` tables are seeded
  (`packages/types/src/permissions.ts` has the canonical key list) but
  nothing reads them yet — every staff member can see everything staff
  can see.
- **Customer list has no email column.** `profiles` doesn't store email
  (that's in `auth.users`, which needs the service-role client to join
  against, or a Postgres view). The admin customer list shows name/phone/
  loyalty points only. Straightforward to add — see the note in
  `apps/admin/src/features/customers/queries.ts`.
- **Low-stock digest emails all admins**, not a configurable distribution
  list or Slack webhook.
- **No inventory reservation.** Stock decrements only on confirmed payment
  (in `fulfillOrderPayment`), not on add-to-cart or checkout-start. Under
  real concurrent traffic on a low-stock item, two customers could both
  reach checkout for the last unit; the second payment would still
  succeed and oversell by one. Low-risk for a single-warehouse launch,
  worth fixing before a flash-sale-style drop.

## Not built (genuinely out of scope for Phase 1)

- **Gift cards, flash sales, blog/CMS admin UI, email marketing/campaign
  builder, staff role management UI.** The `gift_cards`, `blog_posts`,
  and RBAC tables exist in the schema; there's no UI on top of them yet.
- **Product creation/editing UI in admin.** You can change a product's
  status and featured flag from the admin, but creating products, variants,
  and uploading images currently happens via the Supabase dashboard or
  direct SQL/API calls. This is the single biggest gap for actually
  running a store day-to-day — prioritize it first.
- **AI features** (recommendations, AI search, AI support, AI-generated
  descriptions, AI image tagging, AI analytics). The architecture doesn't
  block any of these — `features/products/queries.ts`'s
  `getRelatedProducts()` is a natural seam for a recommendation model, and
  Postgres full-text search in `searchProducts()` is a reasonable fallback
  while an AI-search layer is being built — but none of it is implemented.
- **Multi-currency, multi-warehouse routing, multi-region tax/shipping.**
  The schema supports multiple `warehouses` and the `orders.currency`
  column exists, but there's no logic that picks a warehouse by customer
  region or converts prices across currencies.

## Toward the platform's later phases

The monorepo split (`docs/ARCHITECTURE.md`) and the package boundaries
(`@likiya/database`, `@likiya/payments`, etc.) exist specifically so Phases
2–6 don't require re-architecting:

- **Phase 2 (multi-warehouse/region)**: `warehouses` and
  `inventory_levels` are already per-warehouse; add warehouse-selection
  logic to `adjustInventory()`'s call sites and a shipping-rate-by-region
  table.
- **Phase 3 (multi-country)**: `packages/config` is the place to add
  per-region currency/tax config; `packages/payments` already supports
  providers with different regional strengths (Paystack/Flutterwave skew
  African markets, Stripe is global).
- **Phase 4 (multi-brand)**: `products.brand_id` already exists; a
  multi-brand storefront mainly needs brand-scoped routing and possibly a
  `brands` ownership/permissions model layered onto the existing RBAC
  tables.
- **Phase 5 (marketplace)**: would need a `sellers`/`vendors` table,
  per-vendor order splitting, and payout logic in `packages/payments` —
  the adapter pattern there is designed to add capabilities like this
  without touching the gateway implementations.
- **Phase 6 (AI-powered)**: see "Not built" above — the data model
  (reviews, order history, search) is already shaped to feed
  recommendation and personalization systems when you're ready to build
  them.
