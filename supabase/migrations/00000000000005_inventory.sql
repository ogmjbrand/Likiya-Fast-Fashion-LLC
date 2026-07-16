-- Multi-warehouse inventory, suppliers, and purchase orders.

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  line1 text,
  line2 text,
  city text,
  state text,
  postal_code text,
  country_code char(2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.inventory_levels (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  warehouse_id uuid not null references public.warehouses (id) on delete cascade,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  quantity_incoming integer not null default 0 check (quantity_incoming >= 0),
  low_stock_threshold integer not null default 5,
  updated_at timestamptz not null default now(),
  unique (variant_id, warehouse_id)
);

create index inventory_levels_variant_id_idx on public.inventory_levels (variant_id);
create index inventory_levels_low_stock_idx on public.inventory_levels (warehouse_id)
  where quantity_on_hand <= low_stock_threshold;

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  warehouse_id uuid not null references public.warehouses (id) on delete cascade,
  quantity_delta integer not null,
  reason inventory_movement_reason not null,
  reference_type text, -- 'order', 'return', 'purchase_order', etc.
  reference_id uuid,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_movements_variant_id_idx on public.inventory_movements (variant_id, created_at desc);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  warehouse_id uuid not null references public.warehouses (id) on delete restrict,
  status purchase_order_status not null default 'draft',
  expected_at date,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity_ordered integer not null check (quantity_ordered > 0),
  quantity_received integer not null default 0 check (quantity_received >= 0),
  unit_cost numeric(12, 2) not null check (unit_cost >= 0)
);

create index purchase_order_items_po_id_idx on public.purchase_order_items (purchase_order_id);
