-- Loyalty, notifications, CMS/blog, and audit logging.

create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  points integer not null,
  type loyalty_transaction_type not null,
  reference_type text,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create index loyalty_transactions_user_id_idx on public.loyalty_transactions (user_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  data jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc)
  include (is_read);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  author_id uuid references public.profiles (id) on delete set null,
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null, -- e.g. 'order.status_changed', 'product.updated'
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);
create index activity_logs_actor_idx on public.activity_logs (actor_id, created_at desc);
