-- Covering indexes for foreign key columns that had none. Postgres does not
-- auto-index FKs (only the referenced side gets a unique index for free), so
-- every FK column here would otherwise force a sequential scan on join,
-- cascade delete, and RLS-policy lookups against the referencing table.

create index if not exists blog_posts_author_id_idx on public.blog_posts (author_id);
create index if not exists cart_items_variant_id_idx on public.cart_items (variant_id);
create index if not exists carts_coupon_id_idx on public.carts (coupon_id);
create index if not exists coupon_redemptions_order_id_idx on public.coupon_redemptions (order_id);
create index if not exists coupon_redemptions_user_id_idx on public.coupon_redemptions (user_id);
create index if not exists gift_card_transactions_gift_card_id_idx on public.gift_card_transactions (gift_card_id);
create index if not exists gift_card_transactions_order_id_idx on public.gift_card_transactions (order_id);
create index if not exists gift_cards_purchased_by_idx on public.gift_cards (purchased_by);
create index if not exists inventory_movements_created_by_idx on public.inventory_movements (created_by);
create index if not exists inventory_movements_warehouse_id_idx on public.inventory_movements (warehouse_id);
create index if not exists order_items_variant_id_idx on public.order_items (variant_id);
create index if not exists orders_coupon_id_idx on public.orders (coupon_id);
create index if not exists product_categories_category_id_idx on public.product_categories (category_id);
create index if not exists product_collections_collection_id_idx on public.product_collections (collection_id);
create index if not exists product_images_variant_id_idx on public.product_images (variant_id);
create index if not exists product_option_values_option_id_idx on public.product_option_values (option_id);
create index if not exists product_options_product_id_idx on public.product_options (product_id);
create index if not exists product_variant_option_values_option_value_id_idx on public.product_variant_option_values (option_value_id);
create index if not exists profiles_default_billing_address_id_idx on public.profiles (default_billing_address_id);
create index if not exists profiles_default_shipping_address_id_idx on public.profiles (default_shipping_address_id);
create index if not exists purchase_order_items_variant_id_idx on public.purchase_order_items (variant_id);
create index if not exists purchase_orders_created_by_idx on public.purchase_orders (created_by);
create index if not exists purchase_orders_supplier_id_idx on public.purchase_orders (supplier_id);
create index if not exists purchase_orders_warehouse_id_idx on public.purchase_orders (warehouse_id);
create index if not exists recently_viewed_product_id_idx on public.recently_viewed (product_id);
create index if not exists refunds_order_id_idx on public.refunds (order_id);
create index if not exists refunds_payment_id_idx on public.refunds (payment_id);
create index if not exists refunds_processed_by_idx on public.refunds (processed_by);
create index if not exists return_items_order_item_id_idx on public.return_items (order_item_id);
create index if not exists return_items_return_id_idx on public.return_items (return_id);
create index if not exists returns_user_id_idx on public.returns (user_id);
create index if not exists reviews_order_item_id_idx on public.reviews (order_item_id);
create index if not exists reviews_user_id_idx on public.reviews (user_id);
create index if not exists role_permissions_permission_id_idx on public.role_permissions (permission_id);
create index if not exists staff_role_assignments_assigned_by_idx on public.staff_role_assignments (assigned_by);
create index if not exists staff_role_assignments_role_id_idx on public.staff_role_assignments (role_id);
create index if not exists wishlist_items_variant_id_idx on public.wishlist_items (variant_id);
create index if not exists wishlists_user_id_idx on public.wishlists (user_id);
