-- Minimal local-dev seed data. Safe to re-run (idempotent upserts).
-- Run with: supabase db reset (applies migrations then this file)

insert into public.warehouses (name, code, city, country_code, is_active)
values ('Primary Fulfillment Center', 'MAIN', 'Newark', 'US', true)
on conflict (code) do nothing;

insert into public.brands (name, slug, description, is_active)
values ('Likiya', 'likiya', 'The house label — considered essentials cut for longevity.', true)
on conflict (slug) do nothing;

insert into public.categories (name, slug, description, position, is_active)
values
  ('Women', 'women', 'Womenswear', 1, true),
  ('Men', 'men', 'Menswear', 2, true),
  ('Accessories', 'accessories', 'Bags, jewelry, and finishing pieces', 3, true)
on conflict (slug) do nothing;

insert into public.collections (name, slug, description, is_active, position)
values
  ('New Arrivals', 'new-arrivals', 'Just landed', true, 1),
  ('Best Sellers', 'best-sellers', 'Customer favorites', true, 2),
  ('Sale', 'sale', 'Considered reductions', true, 3)
on conflict (slug) do nothing;

with new_product as (
  insert into public.products (
    brand_id, name, slug, description, material, status, base_price, compare_at_price,
    is_featured, seo_title, seo_description, published_at
  )
  select
    b.id, 'Wool Tailored Coat', 'wool-tailored-coat',
    'A considered, longline coat cut from double-faced Italian wool. Designed to be worn for a decade, not a season.',
    '100% Italian Wool', 'active', 495.00, 650.00,
    true, 'Wool Tailored Coat | Likiya', 'Double-faced Italian wool coat, cut for longevity.', now()
  from public.brands b where b.slug = 'likiya'
  on conflict (slug) do nothing
  returning id
)
insert into public.product_categories (product_id, category_id)
select new_product.id, c.id from new_product, public.categories c where c.slug = 'women'
on conflict do nothing;

insert into public.product_collections (product_id, collection_id)
select p.id, c.id
from public.products p, public.collections c
where p.slug = 'wool-tailored-coat' and c.slug = 'new-arrivals'
on conflict do nothing;

with opt as (
  insert into public.product_options (product_id, name, position)
  select p.id, 'Size', 0 from public.products p where p.slug = 'wool-tailored-coat'
  returning id
), sizes as (
  insert into public.product_option_values (option_id, value, position)
  select opt.id, size, row_number() over ()
  from opt, unnest(array['XS', 'S', 'M', 'L', 'XL']) as size
  returning id, value
)
insert into public.product_variants (product_id, sku, title, price, compare_at_price, is_active, position)
select p.id, 'WTC-' || sizes.value, sizes.value, 495.00, 650.00, true, row_number() over ()
from sizes, public.products p where p.slug = 'wool-tailored-coat'
on conflict (sku) do nothing;

insert into public.product_variant_option_values (variant_id, option_value_id)
select v.id, ov.id
from public.product_variants v
join public.products p on p.id = v.product_id and p.slug = 'wool-tailored-coat'
join public.product_options po on po.product_id = p.id
join public.product_option_values ov on ov.option_id = po.id and ov.value = v.title
on conflict do nothing;

insert into public.product_images (product_id, url, alt_text, position)
select p.id, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200', 'Wool Tailored Coat', 0
from public.products p where p.slug = 'wool-tailored-coat'
on conflict do nothing;

insert into public.inventory_levels (variant_id, warehouse_id, quantity_on_hand, low_stock_threshold)
select v.id, w.id, 25, 5
from public.product_variants v, public.warehouses w
where v.product_id = (select id from public.products where slug = 'wool-tailored-coat') and w.code = 'MAIN'
on conflict (variant_id, warehouse_id) do nothing;

insert into public.coupons (code, description, discount_type, discount_value, min_subtotal, max_uses_per_user, is_active)
values ('WELCOME10', 'Welcome discount — 10% off your first order', 'percentage', 10, 50, 1, true)
on conflict (code) do nothing;
