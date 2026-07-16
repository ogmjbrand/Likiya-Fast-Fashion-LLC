-- Carts, orders, payments, coupons, gift cards, returns, refunds.

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  session_token text,
  currency char(3) not null default 'USD',
  coupon_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_token is not null)
);

create unique index carts_user_id_unique on public.carts (user_id) where user_id is not null;
create unique index carts_session_token_unique on public.carts (session_token) where session_token is not null;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  price_at_add numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type discount_type not null,
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_subtotal numeric(12, 2) default 0,
  max_uses integer,
  max_uses_per_user integer default 1,
  uses_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.carts
  add constraint carts_coupon_fk foreign key (coupon_id) references public.coupons (id) on delete set null;

create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  initial_balance numeric(12, 2) not null check (initial_balance >= 0),
  current_balance numeric(12, 2) not null check (current_balance >= 0),
  currency char(3) not null default 'USD',
  issued_to_email citext,
  purchased_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  guest_email citext,
  status order_status not null default 'pending',
  fulfillment_status fulfillment_status not null default 'unfulfilled',
  currency char(3) not null default 'USD',
  subtotal numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  shipping_total numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  shipping_address jsonb,
  billing_address jsonb,
  coupon_id uuid references public.coupons (id) on delete set null,
  customer_notes text,
  internal_notes text,
  tracking_number text,
  tracking_url text,
  carrier text,
  placed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_email is not null)
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_title text,
  sku text not null,
  image_url text,
  unit_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.reviews
  add constraint reviews_order_item_fk foreign key (order_item_id) references public.order_items (id) on delete set null;

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  order_id uuid not null references public.orders (id) on delete cascade,
  amount_discounted numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

create table public.gift_card_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  amount numeric(12, 2) not null,
  type gift_card_transaction_type not null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider payment_provider not null,
  provider_reference text not null,
  status payment_status not null default 'pending',
  amount numeric(12, 2) not null,
  currency char(3) not null default 'USD',
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_reference)
);

create index payments_order_id_idx on public.payments (order_id);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  reason text,
  status refund_status not null default 'pending',
  provider_reference text,
  processed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  status return_status not null default 'requested',
  reason text not null,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.returns (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  condition text,
  restocked boolean not null default false
);

create index returns_order_id_idx on public.returns (order_id);
