# Database

PostgreSQL via Supabase. Schema lives in `supabase/migrations/*.sql`,
applied in filename order — read them in that order too; each one assumes
the previous ones already ran.

| File | Contents |
| --- | --- |
| `00000000000001_extensions.sql` | `pgcrypto`, `pg_trgm`, `unaccent`, `citext` |
| `00000000000002_enums.sql` | Every enum type (`order_status`, `payment_provider`, etc.) |
| `00000000000003_core_tables.sql` | `profiles`, RBAC tables (`roles`/`permissions`/`role_permissions`), `addresses`, `newsletter_subscribers` |
| `00000000000004_catalog.sql` | `brands`, `categories`, `collections`, `products`, options/variants, `reviews`, `wishlists`, `recently_viewed` |
| `00000000000005_inventory.sql` | `warehouses`, `inventory_levels`, `inventory_movements`, `suppliers`, `purchase_orders` |
| `00000000000006_commerce.sql` | `carts`/`cart_items`, `orders`/`order_items`, `payments`, `refunds`, `returns`, `coupons`, `gift_cards` |
| `00000000000007_engagement.sql` | `loyalty_transactions`, `notifications`, `blog_posts`, `activity_logs` |
| `00000000000008_functions_triggers.sql` | See below |
| `00000000000009_rls.sql` | Row Level Security policies for every table |
| `00000000000010_storage.sql` | Storage buckets (`product-images`, `avatars`, `cms-assets`) + their policies |

`supabase/seed/seed.sql` inserts a warehouse, a brand, three categories,
three collections, one sample product with variants, and a welcome coupon —
enough to see the storefront render real data locally. It's idempotent
(`on conflict do nothing`), so `supabase db reset` is safe to re-run.

## Key design decisions

**Address snapshots, not foreign keys.** `orders.shipping_address` and
`orders.billing_address` are `jsonb`, not a foreign key to `addresses`.
If a customer edits or deletes a saved address after placing an order, the
order should still show what was actually shipped where — that's a
deliberate denormalization, not a missed relation.

**Order items snapshot product data too.** `order_items` stores
`product_name`, `variant_title`, `sku`, and `unit_price` as columns, not
just a `variant_id` foreign key. Products get renamed, repriced, and
discontinued; the order history shouldn't retroactively change when they
do.

**`profiles.role` vs. the RBAC tables.** `profiles.role` is a simple enum
(`customer` / `staff` / `admin` / `super_admin`) and is what every RLS
policy and the admin middleware actually check — it's fast (one column,
no joins) and covers everything built so far. The `roles` /
`permissions` / `role_permissions` / `staff_role_assignments` tables exist
for finer-grained permissions (e.g. "can edit products but not view
revenue") and are seeded with the keys in `packages/types/src/permissions.ts`,
but nothing enforces them yet — see `ROADMAP.md`.

## Functions and triggers (`00000000000008_functions_triggers.sql`)

- `handle_new_user()` — trigger on `auth.users` insert; creates the
  matching `profiles` row. Without this, a new sign-up would have an auth
  identity but no profile, and every RLS policy that joins through
  `profiles` would silently deny them.
- `products_search_vector_update()` — maintains `products.search_vector`
  (a weighted `tsvector`: name > description > material) on insert/update,
  which `features/products/queries.ts`'s `searchProducts()` queries via
  `textSearch(..., { type: "websearch" })`.
- `generate_order_number()` / `generate_po_number()` — human-readable
  sequential IDs (`LK-2601-000042`, `PO-2601-00012`) via a dedicated
  sequence, so support staff can read an order number over the phone.
- `refresh_product_rating()` — recomputes `products.avg_rating` and
  `review_count` whenever a review is inserted, updated, or deleted, so
  the storefront never has to aggregate reviews at read time.
- `adjust_inventory(...)` — the *only* code path that should ever change
  `inventory_levels.quantity_on_hand`. It upserts the level and inserts a
  matching `inventory_movements` row in the same statement, so stock
  changes and their audit trail can never drift apart. Wrapped by
  `packages/inventory`'s `adjustInventory()` — call that from application
  code rather than updating `inventory_levels` directly.
- `award_loyalty_points()` — trigger on `orders.status` transitioning to
  `completed`; awards 1 point per currency unit spent.

## Row Level Security

Two `SECURITY DEFINER` helper functions gate almost every policy:

```sql
public.is_staff()  -- role in ('staff', 'admin', 'super_admin')
public.is_admin()  -- role in ('admin', 'super_admin')
```

The shape repeats across tables: public read of *active/published* rows
(`products.status = 'active'`, `collections.is_active`, ...) or staff
bypass, owner-scoped read/write for personal data (`addresses`, `orders`,
`wishlists`), and staff-only for operational tables (`inventory_levels`,
`suppliers`, `purchase_orders`). Read a specific table's policy before
assuming a query will be visible to a given role — `supabase/migrations/00000000000009_rls.sql`
is the source of truth, not this summary.

**Guest checkout and RLS.** Guest orders have `user_id = null` and
`guest_email` set instead. `orders_owner_read`'s `user_id = auth.uid()`
check can never match for an anonymous visitor — even for their own order,
since `null = null` isn't true in SQL. The checkout success page
(`apps/storefront/.../checkout/success/page.tsx`) therefore looks the order
up with the service-role client instead of the anon-key one, which is the
correct tool here rather than a workaround: `order_number` is an
unguessable value only known to whoever the checkout flow itself just
redirected, and the query only ever returns non-sensitive summary fields
(total, currency, status). Don't switch that lookup back to the anon
client without also adding a policy for it.

## Regenerating types

`packages/database/src/types.ts` is hand-authored to match the migrations
above — deliberately, so the app type-checks before any Supabase project
exists. Once you have a real project linked:

```bash
pnpm db:types   # writes packages/database/src/generated-types.ts
```

Then switch `packages/database/src/index.ts` to export from the generated
file instead of `types.ts`, and delete the hand-authored one. Don't let
both exist and drift.
