-- Product catalog: brands, categories, collections, products, variants.

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  position integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_parent_id_idx on public.categories (parent_id);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_flash_sale boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  position integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  care_instructions text,
  material text,
  status product_status not null default 'draft',
  base_price numeric(12, 2) not null check (base_price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price >= 0),
  cost_price numeric(12, 2) check (cost_price >= 0),
  currency char(3) not null default 'USD',
  is_featured boolean not null default false,
  avg_rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  seo_title text,
  seo_description text,
  search_vector tsvector,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_idx on public.products (status);
create index products_brand_id_idx on public.products (brand_id);
create index products_search_vector_idx on public.products using gin (search_vector);
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);

create table public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (product_id, category_id)
);

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  position integer not null default 0,
  primary key (product_id, collection_id)
);

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null, -- e.g. "Color", "Size"
  position integer not null default 0
);

create table public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options (id) on delete cascade,
  value text not null, -- e.g. "Ivory", "M"
  position integer not null default 0
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  barcode text,
  title text, -- e.g. "Ivory / M", auto-derived from option values
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price >= 0),
  cost_price numeric(12, 2) check (cost_price >= 0),
  weight_grams integer,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_id_idx on public.product_variants (product_id);
create index product_variants_sku_idx on public.product_variants (sku);

create table public.product_variant_option_values (
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  option_value_id uuid not null references public.product_option_values (id) on delete cascade,
  primary key (variant_id, option_value_id)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  url text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_item_id uuid, -- fk added in commerce.sql after order_items exists
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default true,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id, order_item_id)
);

create index reviews_product_id_idx on public.reviews (product_id);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null default 'My Wishlist',
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, variant_id)
);

create table public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  session_token text,
  product_id uuid not null references public.products (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  check (user_id is not null or session_token is not null)
);

create index recently_viewed_user_id_idx on public.recently_viewed (user_id, viewed_at desc);
