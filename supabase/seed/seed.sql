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
  ('Accessories', 'accessories', 'Bags, jewelry, and finishing pieces', 3, true),
  ('Shoes', 'shoes', 'Considered footwear, built to last.', 4, true),
  ('Bags', 'bags', 'Structured bags for everyday carry.', 5, true),
  ('Body Cream', 'body-cream', 'Nourishing body care.', 6, true),
  ('Hair Oil', 'hair-oil', 'Considered hair care.', 7, true)
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

-- Shoes: Size x Color (demonstrates the color-swatch variant UI)
with new_product as (
  insert into public.products (
    brand_id, name, slug, description, material, status, base_price, compare_at_price,
    is_featured, seo_title, seo_description, published_at
  )
  select
    b.id, 'Leather Ankle Boots', 'leather-ankle-boots',
    'A considered ankle boot in full-grain leather, finished with a low block heel. Built to be resoled, not replaced.',
    'Full-Grain Leather', 'active', 245.00, 320.00,
    true, 'Leather Ankle Boots | Likiya', 'Full-grain leather ankle boots, considered construction.', now()
  from public.brands b where b.slug = 'likiya'
  on conflict (slug) do nothing
  returning id
),
cat_link as (
  insert into public.product_categories (product_id, category_id)
  select new_product.id, c.id from new_product, public.categories c where c.slug = 'shoes'
  on conflict do nothing
),
size_opt as (
  insert into public.product_options (product_id, name, position)
  select id, 'Size', 0 from new_product
  returning id
),
size_vals as (
  insert into public.product_option_values (option_id, value, position)
  select size_opt.id, v, row_number() over ()
  from size_opt, unnest(array['8', '9', '10']) as v
  returning id, value
),
color_opt as (
  insert into public.product_options (product_id, name, position)
  select id, 'Color', 1 from new_product
  returning id
),
color_vals as (
  insert into public.product_option_values (option_id, value, position)
  select color_opt.id, v, row_number() over ()
  from color_opt, unnest(array['Black', 'Tan']) as v
  returning id, value
),
variant_rows as (
  insert into public.product_variants (product_id, sku, title, price, compare_at_price, is_active, position)
  select p.id, v.sku, v.title, 245.00, 320.00, true, v.pos
  from new_product p, (values
    ('LAB-BLK-8', '8 / Black', 1),
    ('LAB-BLK-9', '9 / Black', 2),
    ('LAB-BLK-10', '10 / Black', 3),
    ('LAB-TAN-8', '8 / Tan', 4),
    ('LAB-TAN-9', '9 / Tan', 5),
    ('LAB-TAN-10', '10 / Tan', 6)
  ) as v(sku, title, pos)
  on conflict (sku) do nothing
  returning id, title
),
link_size as (
  insert into public.product_variant_option_values (variant_id, option_value_id)
  select vr.id, sv.id from variant_rows vr join size_vals sv on sv.value = split_part(vr.title, ' / ', 1)
),
link_color as (
  insert into public.product_variant_option_values (variant_id, option_value_id)
  select vr.id, cv.id from variant_rows vr join color_vals cv on cv.value = split_part(vr.title, ' / ', 2)
),
images as (
  insert into public.product_images (product_id, url, alt_text, position)
  select p.id, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200', 'Leather Ankle Boots', 0
  from new_product p
)
insert into public.inventory_levels (variant_id, warehouse_id, quantity_on_hand, low_stock_threshold)
select vr.id, w.id, 15, 5
from variant_rows vr, public.warehouses w where w.code = 'MAIN'
on conflict (variant_id, warehouse_id) do nothing;

-- Bags: Color only
with new_product as (
  insert into public.products (
    brand_id, name, slug, description, material, status, base_price, compare_at_price,
    is_featured, seo_title, seo_description, published_at
  )
  select
    b.id, 'Structured Tote Bag', 'structured-tote-bag',
    'A structured leather tote built for daily carry — considered hardware, a reinforced base, and room for everything you actually need.',
    'Vegetable-Tanned Leather', 'active', 195.00, 260.00,
    true, 'Structured Tote Bag | Likiya', 'Structured leather tote, considered daily-carry hardware.', now()
  from public.brands b where b.slug = 'likiya'
  on conflict (slug) do nothing
  returning id
),
cat_link as (
  insert into public.product_categories (product_id, category_id)
  select new_product.id, c.id from new_product, public.categories c where c.slug = 'bags'
  on conflict do nothing
),
color_opt as (
  insert into public.product_options (product_id, name, position)
  select id, 'Color', 0 from new_product
  returning id
),
color_vals as (
  insert into public.product_option_values (option_id, value, position)
  select color_opt.id, v, row_number() over ()
  from color_opt, unnest(array['Black', 'Camel', 'Blush']) as v
  returning id, value
),
variant_rows as (
  insert into public.product_variants (product_id, sku, title, price, compare_at_price, is_active, position)
  select p.id, v.sku, v.title, 195.00, 260.00, true, v.pos
  from new_product p, (values
    ('STB-BLK', 'Black', 1),
    ('STB-CML', 'Camel', 2),
    ('STB-BLS', 'Blush', 3)
  ) as v(sku, title, pos)
  on conflict (sku) do nothing
  returning id, title
),
link_color as (
  insert into public.product_variant_option_values (variant_id, option_value_id)
  select vr.id, cv.id from variant_rows vr join color_vals cv on cv.value = vr.title
),
images as (
  insert into public.product_images (product_id, url, alt_text, position)
  select p.id, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200', 'Structured Tote Bag', 0
  from new_product p
)
insert into public.inventory_levels (variant_id, warehouse_id, quantity_on_hand, low_stock_threshold)
select vr.id, w.id, 20, 5
from variant_rows vr, public.warehouses w where w.code = 'MAIN'
on conflict (variant_id, warehouse_id) do nothing;

-- Body Cream: Size/volume only
with new_product as (
  insert into public.products (
    brand_id, name, slug, description, material, status, base_price, compare_at_price,
    is_featured, seo_title, seo_description, published_at
  )
  select
    b.id, 'Whipped Body Cream', 'whipped-body-cream',
    'A rich, fast-absorbing body cream whipped with shea butter and jojoba oil. Considered skincare, not filler ingredients.',
    'Shea Butter, Jojoba Oil', 'active', 38.00, null,
    false, 'Whipped Body Cream | Likiya', 'Whipped shea butter body cream.', now()
  from public.brands b where b.slug = 'likiya'
  on conflict (slug) do nothing
  returning id
),
cat_link as (
  insert into public.product_categories (product_id, category_id)
  select new_product.id, c.id from new_product, public.categories c where c.slug = 'body-cream'
  on conflict do nothing
),
size_opt as (
  insert into public.product_options (product_id, name, position)
  select id, 'Size', 0 from new_product
  returning id
),
size_vals as (
  insert into public.product_option_values (option_id, value, position)
  select size_opt.id, v, row_number() over ()
  from size_opt, unnest(array['100ml', '250ml']) as v
  returning id, value
),
variant_rows as (
  insert into public.product_variants (product_id, sku, title, price, compare_at_price, is_active, position)
  select p.id, v.sku, v.title, v.price, null, true, v.pos
  from new_product p, (values
    ('WBC-100', '100ml', 38.00, 1),
    ('WBC-250', '250ml', 78.00, 2)
  ) as v(sku, title, price, pos)
  on conflict (sku) do nothing
  returning id, title
),
link_size as (
  insert into public.product_variant_option_values (variant_id, option_value_id)
  select vr.id, sv.id from variant_rows vr join size_vals sv on sv.value = vr.title
),
images as (
  insert into public.product_images (product_id, url, alt_text, position)
  select p.id, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200', 'Whipped Body Cream', 0
  from new_product p
)
insert into public.inventory_levels (variant_id, warehouse_id, quantity_on_hand, low_stock_threshold)
select vr.id, w.id, 40, 10
from variant_rows vr, public.warehouses w where w.code = 'MAIN'
on conflict (variant_id, warehouse_id) do nothing;

-- Hair Oil: Size/volume only
with new_product as (
  insert into public.products (
    brand_id, name, slug, description, material, status, base_price, compare_at_price,
    is_featured, seo_title, seo_description, published_at
  )
  select
    b.id, 'Nourishing Hair Oil', 'nourishing-hair-oil',
    'A lightweight blend of argan and castor oil, formulated to strengthen and add shine without weighing hair down.',
    'Argan Oil, Castor Oil', 'active', 32.00, null,
    false, 'Nourishing Hair Oil | Likiya', 'Argan and castor oil hair treatment.', now()
  from public.brands b where b.slug = 'likiya'
  on conflict (slug) do nothing
  returning id
),
cat_link as (
  insert into public.product_categories (product_id, category_id)
  select new_product.id, c.id from new_product, public.categories c where c.slug = 'hair-oil'
  on conflict do nothing
),
size_opt as (
  insert into public.product_options (product_id, name, position)
  select id, 'Size', 0 from new_product
  returning id
),
size_vals as (
  insert into public.product_option_values (option_id, value, position)
  select size_opt.id, v, row_number() over ()
  from size_opt, unnest(array['50ml', '100ml']) as v
  returning id, value
),
variant_rows as (
  insert into public.product_variants (product_id, sku, title, price, compare_at_price, is_active, position)
  select p.id, v.sku, v.title, v.price, null, true, v.pos
  from new_product p, (values
    ('NHO-50', '50ml', 32.00, 1),
    ('NHO-100', '100ml', 56.00, 2)
  ) as v(sku, title, price, pos)
  on conflict (sku) do nothing
  returning id, title
),
link_size as (
  insert into public.product_variant_option_values (variant_id, option_value_id)
  select vr.id, sv.id from variant_rows vr join size_vals sv on sv.value = vr.title
),
images as (
  insert into public.product_images (product_id, url, alt_text, position)
  select p.id, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200', 'Nourishing Hair Oil', 0
  from new_product p
)
insert into public.inventory_levels (variant_id, warehouse_id, quantity_on_hand, low_stock_threshold)
select vr.id, w.id, 40, 10
from variant_rows vr, public.warehouses w where w.code = 'MAIN'
on conflict (variant_id, warehouse_id) do nothing;
