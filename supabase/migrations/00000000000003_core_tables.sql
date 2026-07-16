-- Core identity, RBAC, and address tables.

-- One row per auth.users row; created by the handle_new_user trigger (see functions_triggers.sql).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role user_role not null default 'customer',
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  marketing_opt_in boolean not null default false,
  default_shipping_address_id uuid,
  default_billing_address_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with app-specific profile and RBAC data.';

-- Fine-grained RBAC used by the admin dashboard, layered on top of profiles.role.
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- e.g. 'orders.write', 'products.write'
  description text
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.staff_role_assignments (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  assigned_by uuid references public.profiles (id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type address_type not null default 'shipping',
  full_name text not null,
  company text,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country_code char(2) not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

alter table public.profiles
  add constraint profiles_default_shipping_address_fk
  foreign key (default_shipping_address_id) references public.addresses (id) on delete set null;

alter table public.profiles
  add constraint profiles_default_billing_address_fk
  foreign key (default_billing_address_id) references public.addresses (id) on delete set null;

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  is_subscribed boolean not null default true,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
