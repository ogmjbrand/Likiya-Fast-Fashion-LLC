-- Row Level Security. Default posture: deny-all, then allow narrowly.
-- Staff/admin bypass is granted via public.is_staff(), checked against
-- profiles.role so it works from any client using the user's JWT.
--
-- Two performance rules followed throughout this file (both are Supabase
-- Postgres linter recommendations, not stylistic preferences):
--   1. `auth.uid()` / `auth.jwt()` are wrapped as `(select auth.uid())` so
--      Postgres evaluates them once per statement instead of once per row.
--      `is_staff()`/`is_admin()`/`current_role()` are already STABLE
--      functions and don't need this — Postgres caches STABLE calls per
--      statement on its own.
--   2. Every table gets at most one permissive policy per action (select/
--      insert/update/delete) per role. Where a public-read policy and a
--      staff policy would otherwise both apply to `SELECT`, the staff
--      policy is scoped to insert/update/delete only (never `for all`),
--      or the two conditions are merged into a single OR'd policy.

create or replace function public.current_role()
returns user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_role() in ('staff', 'admin', 'super_admin'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_role() in ('admin', 'super_admin'), false);
$$;

-- Enable RLS everywhere -------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.staff_role_assignments enable row level security;
alter table public.addresses enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_collections enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_variant_option_values enable row level security;
alter table public.product_images enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.recently_viewed enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.gift_cards enable row level security;
alter table public.gift_card_transactions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.returns enable row level security;
alter table public.return_items enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.blog_posts enable row level security;
alter table public.activity_logs enable row level security;

-- profiles --------------------------------------------------------------------

create policy "profiles_select" on public.profiles
  for select using (id = (select auth.uid()) or public.is_staff());

create policy "profiles_update" on public.profiles
  for update using (id = (select auth.uid()) or public.is_admin())
  with check ((id = (select auth.uid()) and role = 'customer') or public.is_admin());

create policy "profiles_admin_insert" on public.profiles
  for insert with check (public.is_admin());

create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

-- RBAC tables: staff-readable, admin-writable ---------------------------------

create policy "roles_select" on public.roles for select using (public.is_staff());
create policy "roles_admin_insert" on public.roles for insert with check (public.is_admin());
create policy "roles_admin_update" on public.roles for update using (public.is_admin());
create policy "roles_admin_delete" on public.roles for delete using (public.is_admin());

create policy "permissions_select" on public.permissions for select using (public.is_staff());
create policy "permissions_admin_insert" on public.permissions for insert with check (public.is_admin());
create policy "permissions_admin_update" on public.permissions for update using (public.is_admin());
create policy "permissions_admin_delete" on public.permissions for delete using (public.is_admin());

create policy "role_permissions_select" on public.role_permissions for select using (public.is_staff());
create policy "role_permissions_admin_insert" on public.role_permissions for insert with check (public.is_admin());
create policy "role_permissions_admin_update" on public.role_permissions for update using (public.is_admin());
create policy "role_permissions_admin_delete" on public.role_permissions for delete using (public.is_admin());

create policy "staff_role_assignments_select" on public.staff_role_assignments for select using (public.is_staff());
create policy "staff_role_assignments_admin_insert" on public.staff_role_assignments for insert with check (public.is_admin());
create policy "staff_role_assignments_admin_update" on public.staff_role_assignments for update using (public.is_admin());
create policy "staff_role_assignments_admin_delete" on public.staff_role_assignments for delete using (public.is_admin());

-- addresses ---------------------------------------------------------------------

create policy "addresses_select" on public.addresses
  for select using (user_id = (select auth.uid()) or public.is_staff());
create policy "addresses_insert" on public.addresses
  for insert with check (user_id = (select auth.uid()) or public.is_staff());
create policy "addresses_update" on public.addresses
  for update using (user_id = (select auth.uid()) or public.is_staff());
create policy "addresses_delete" on public.addresses
  for delete using (user_id = (select auth.uid()) or public.is_staff());

-- newsletter: anyone can subscribe, only staff can read the list -------------

create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);
create policy "newsletter_staff_read" on public.newsletter_subscribers
  for select using (public.is_staff());
create policy "newsletter_staff_update" on public.newsletter_subscribers
  for update using (public.is_staff());

-- catalog: public read of active/published rows, staff full access ----------

create policy "brands_public_read" on public.brands for select using (is_active or public.is_staff());
create policy "brands_staff_insert" on public.brands for insert with check (public.is_staff());
create policy "brands_staff_update" on public.brands for update using (public.is_staff());
create policy "brands_admin_delete" on public.brands for delete using (public.is_admin());

create policy "categories_public_read" on public.categories for select using (is_active or public.is_staff());
create policy "categories_staff_insert" on public.categories for insert with check (public.is_staff());
create policy "categories_staff_update" on public.categories for update using (public.is_staff());
create policy "categories_admin_delete" on public.categories for delete using (public.is_admin());

create policy "collections_public_read" on public.collections for select using (is_active or public.is_staff());
create policy "collections_staff_insert" on public.collections for insert with check (public.is_staff());
create policy "collections_staff_update" on public.collections for update using (public.is_staff());
create policy "collections_admin_delete" on public.collections for delete using (public.is_admin());

create policy "products_public_read" on public.products for select using (status = 'active' or public.is_staff());
create policy "products_staff_insert" on public.products for insert with check (public.is_staff());
create policy "products_staff_update" on public.products for update using (public.is_staff());
create policy "products_admin_delete" on public.products for delete using (public.is_admin());

create policy "product_categories_public_read" on public.product_categories for select using (true);
create policy "product_categories_staff_insert" on public.product_categories for insert with check (public.is_staff());
create policy "product_categories_staff_update" on public.product_categories for update using (public.is_staff());
create policy "product_categories_staff_delete" on public.product_categories for delete using (public.is_staff());

create policy "product_collections_public_read" on public.product_collections for select using (true);
create policy "product_collections_staff_insert" on public.product_collections for insert with check (public.is_staff());
create policy "product_collections_staff_update" on public.product_collections for update using (public.is_staff());
create policy "product_collections_staff_delete" on public.product_collections for delete using (public.is_staff());

create policy "product_options_public_read" on public.product_options for select using (true);
create policy "product_options_staff_insert" on public.product_options for insert with check (public.is_staff());
create policy "product_options_staff_update" on public.product_options for update using (public.is_staff());
create policy "product_options_staff_delete" on public.product_options for delete using (public.is_staff());

create policy "product_option_values_public_read" on public.product_option_values for select using (true);
create policy "product_option_values_staff_insert" on public.product_option_values for insert with check (public.is_staff());
create policy "product_option_values_staff_update" on public.product_option_values for update using (public.is_staff());
create policy "product_option_values_staff_delete" on public.product_option_values for delete using (public.is_staff());

create policy "product_variants_public_read" on public.product_variants for select using (is_active or public.is_staff());
create policy "product_variants_staff_insert" on public.product_variants for insert with check (public.is_staff());
create policy "product_variants_staff_update" on public.product_variants for update using (public.is_staff());
create policy "product_variants_staff_delete" on public.product_variants for delete using (public.is_staff());

create policy "product_variant_option_values_public_read" on public.product_variant_option_values for select using (true);
create policy "product_variant_option_values_staff_insert" on public.product_variant_option_values for insert with check (public.is_staff());
create policy "product_variant_option_values_staff_update" on public.product_variant_option_values for update using (public.is_staff());
create policy "product_variant_option_values_staff_delete" on public.product_variant_option_values for delete using (public.is_staff());

create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_images_staff_insert" on public.product_images for insert with check (public.is_staff());
create policy "product_images_staff_update" on public.product_images for update using (public.is_staff());
create policy "product_images_staff_delete" on public.product_images for delete using (public.is_staff());

-- reviews: public read of approved reviews, owners manage their own ----------

create policy "reviews_select" on public.reviews
  for select using (is_approved or user_id = (select auth.uid()) or public.is_staff());
create policy "reviews_insert" on public.reviews
  for insert with check (user_id = (select auth.uid()));
create policy "reviews_update" on public.reviews
  for update using (user_id = (select auth.uid()) or public.is_staff());
create policy "reviews_delete" on public.reviews
  for delete using (user_id = (select auth.uid()) or public.is_staff());

-- wishlists -------------------------------------------------------------------

create policy "wishlists_select" on public.wishlists
  for select using (user_id = (select auth.uid()));
create policy "wishlists_insert" on public.wishlists
  for insert with check (user_id = (select auth.uid()));
create policy "wishlists_update" on public.wishlists
  for update using (user_id = (select auth.uid()));
create policy "wishlists_delete" on public.wishlists
  for delete using (user_id = (select auth.uid()));

create policy "wishlist_items_select" on public.wishlist_items
  for select using (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = (select auth.uid()))
  );
create policy "wishlist_items_insert" on public.wishlist_items
  for insert with check (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = (select auth.uid()))
  );
create policy "wishlist_items_delete" on public.wishlist_items
  for delete using (
    exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = (select auth.uid()))
  );

-- recently viewed ---------------------------------------------------------------

create policy "recently_viewed_select" on public.recently_viewed
  for select using (user_id = (select auth.uid()) or public.is_staff());
create policy "recently_viewed_insert" on public.recently_viewed
  for insert with check (user_id = (select auth.uid()) or user_id is null);
create policy "recently_viewed_delete" on public.recently_viewed
  for delete using (user_id = (select auth.uid()) or public.is_staff());

-- inventory & operations: staff-only -------------------------------------------

create policy "warehouses_staff_all" on public.warehouses for all using (public.is_staff()) with check (public.is_staff());
create policy "inventory_levels_staff_all" on public.inventory_levels for all using (public.is_staff()) with check (public.is_staff());
create policy "inventory_movements_staff_all" on public.inventory_movements for all using (public.is_staff()) with check (public.is_staff());
create policy "suppliers_staff_all" on public.suppliers for all using (public.is_staff()) with check (public.is_staff());
create policy "purchase_orders_staff_all" on public.purchase_orders for all using (public.is_staff()) with check (public.is_staff());
create policy "purchase_order_items_staff_all" on public.purchase_order_items for all using (public.is_staff()) with check (public.is_staff());

-- carts / cart_items: owner (by user_id) or matching guest session -----------
-- Guest carts are addressed via session_token, validated app-side through a
-- SECURITY DEFINER RPC (see cart feature) since anonymous clients have no JWT
-- claim to match a session_token against.

create policy "carts_select" on public.carts
  for select using (user_id = (select auth.uid()) or public.is_staff());
create policy "carts_insert" on public.carts
  for insert with check (user_id = (select auth.uid()) or public.is_staff());
create policy "carts_update" on public.carts
  for update using (user_id = (select auth.uid()) or public.is_staff());
create policy "carts_delete" on public.carts
  for delete using (user_id = (select auth.uid()) or public.is_staff());

create policy "cart_items_select" on public.cart_items
  for select using (
    exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = (select auth.uid()) or public.is_staff()))
  );
create policy "cart_items_insert" on public.cart_items
  for insert with check (
    exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = (select auth.uid()) or public.is_staff()))
  );
create policy "cart_items_update" on public.cart_items
  for update using (
    exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = (select auth.uid()) or public.is_staff()))
  );
create policy "cart_items_delete" on public.cart_items
  for delete using (
    exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = (select auth.uid()) or public.is_staff()))
  );

-- coupons / gift cards: public can validate active coupons, staff manage ------

create policy "coupons_public_read_active" on public.coupons
  for select using (is_active or public.is_staff());
create policy "coupons_staff_insert" on public.coupons for insert with check (public.is_staff());
create policy "coupons_staff_update" on public.coupons for update using (public.is_staff());
create policy "coupons_staff_delete" on public.coupons for delete using (public.is_staff());

create policy "coupon_redemptions_select" on public.coupon_redemptions
  for select using (user_id = (select auth.uid()) or public.is_staff());
create policy "coupon_redemptions_staff_insert" on public.coupon_redemptions
  for insert with check (public.is_staff());

create policy "gift_cards_select" on public.gift_cards
  for select using (
    issued_to_email = ((select auth.jwt()) ->> 'email') or purchased_by = (select auth.uid()) or public.is_staff()
  );
create policy "gift_cards_staff_insert" on public.gift_cards for insert with check (public.is_staff());
create policy "gift_cards_staff_update" on public.gift_cards for update using (public.is_staff());
create policy "gift_cards_staff_delete" on public.gift_cards for delete using (public.is_staff());

create policy "gift_card_transactions_staff_read" on public.gift_card_transactions
  for select using (public.is_staff());
create policy "gift_card_transactions_staff_write" on public.gift_card_transactions
  for insert with check (public.is_staff());

-- orders / order_items: owner (incl. guest via app-layer) + staff ------------

create policy "orders_select" on public.orders
  for select using (user_id = (select auth.uid()) or public.is_staff());
create policy "orders_insert" on public.orders
  for insert with check (public.is_staff() or user_id = (select auth.uid()));
create policy "orders_staff_update" on public.orders
  for update using (public.is_staff());

create policy "order_items_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_staff()))
  );
create policy "order_items_staff_insert" on public.order_items for insert with check (public.is_staff());
create policy "order_items_staff_update" on public.order_items for update using (public.is_staff());
create policy "order_items_staff_delete" on public.order_items for delete using (public.is_staff());

-- payments / refunds / returns: owner read, staff manage ----------------------

create policy "payments_select" on public.payments
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_staff()))
  );
create policy "payments_staff_insert" on public.payments for insert with check (public.is_staff());
create policy "payments_staff_update" on public.payments for update using (public.is_staff());
create policy "payments_staff_delete" on public.payments for delete using (public.is_staff());

create policy "refunds_select" on public.refunds
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_staff()))
  );
create policy "refunds_staff_insert" on public.refunds for insert with check (public.is_staff());
create policy "refunds_staff_update" on public.refunds for update using (public.is_staff());
create policy "refunds_staff_delete" on public.refunds for delete using (public.is_staff());

create policy "returns_select" on public.returns
  for select using (user_id = (select auth.uid()) or public.is_staff());
create policy "returns_insert" on public.returns
  for insert with check (user_id = (select auth.uid()));
create policy "returns_staff_update" on public.returns
  for update using (public.is_staff());

create policy "return_items_select" on public.return_items
  for select using (
    exists (select 1 from public.returns r where r.id = return_id and (r.user_id = (select auth.uid()) or public.is_staff()))
  );
create policy "return_items_insert" on public.return_items
  for insert with check (
    exists (select 1 from public.returns r where r.id = return_id and r.user_id = (select auth.uid()))
  );
create policy "return_items_staff_update" on public.return_items
  for update using (public.is_staff());

-- loyalty / notifications: owner read-only, system/staff write ----------------

create policy "loyalty_transactions_select" on public.loyalty_transactions
  for select using (user_id = (select auth.uid()) or public.is_staff());
create policy "loyalty_transactions_staff_insert" on public.loyalty_transactions
  for insert with check (public.is_staff());

create policy "notifications_select" on public.notifications
  for select using (user_id = (select auth.uid()));
create policy "notifications_update" on public.notifications
  for update using (user_id = (select auth.uid()));
create policy "notifications_staff_insert" on public.notifications
  for insert with check (public.is_staff());

-- CMS: public reads published posts, staff manage everything ------------------

create policy "blog_posts_public_read" on public.blog_posts
  for select using (status = 'published' or public.is_staff());
create policy "blog_posts_staff_insert" on public.blog_posts for insert with check (public.is_staff());
create policy "blog_posts_staff_update" on public.blog_posts for update using (public.is_staff());
create policy "blog_posts_staff_delete" on public.blog_posts for delete using (public.is_staff());

-- activity logs: staff read-only, inserted via SECURITY DEFINER helpers -----

create policy "activity_logs_staff_read" on public.activity_logs
  for select using (public.is_staff());
create policy "activity_logs_staff_insert" on public.activity_logs
  for insert with check (public.is_staff());
