-- Shared functions and triggers: updated_at maintenance, profile provisioning,
-- search indexing, human-friendly numbering, and denormalized aggregates.

-- 1. Generic updated_at maintenance -----------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'addresses', 'brands', 'categories', 'collections', 'products',
    'product_variants', 'carts', 'cart_items', 'orders', 'payments', 'refunds',
    'returns', 'purchase_orders', 'reviews'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end $$;

-- 2. Provision a profile row whenever a new auth user is created ------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Full-text search vector for products ------------------------------------

create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(new.name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(new.material, ''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(new.description, ''))), 'B');
  return new;
end;
$$;

create trigger products_search_vector_trigger
  before insert or update of name, description, material on public.products
  for each row execute function public.products_search_vector_update();

-- 4. Human-friendly order / PO numbering --------------------------------------

create sequence if not exists public.order_number_seq;
create sequence if not exists public.po_number_seq;

create or replace function public.generate_order_number()
returns text
language sql
set search_path = public
as $$
  select 'LK-' || to_char(now(), 'YYMM') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
$$;

create or replace function public.set_order_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.order_number is null then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$;

create trigger orders_set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();

create or replace function public.generate_po_number()
returns text
language sql
set search_path = public
as $$
  select 'PO-' || to_char(now(), 'YYMM') || '-' || lpad(nextval('public.po_number_seq')::text, 5, '0');
$$;

create or replace function public.set_po_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.po_number is null then
    new.po_number := public.generate_po_number();
  end if;
  return new;
end;
$$;

create trigger purchase_orders_set_po_number
  before insert on public.purchase_orders
  for each row execute function public.set_po_number();

-- 5. Keep product rating aggregates in sync with reviews ----------------------

create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_product_id uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set
    avg_rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.product_id = target_product_id and r.is_approved
    ), 0),
    review_count = (
      select count(*)
      from public.reviews r
      where r.product_id = target_product_id and r.is_approved
    )
  where p.id = target_product_id;
  return null;
end;
$$;

create trigger reviews_refresh_product_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- 6. Inventory: adjust stock levels and log a movement atomically ------------

create or replace function public.adjust_inventory(
  p_variant_id uuid,
  p_warehouse_id uuid,
  p_quantity_delta integer,
  p_reason inventory_movement_reason,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_note text default null,
  p_created_by uuid default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- This function is SECURITY DEFINER and auto-exposed via PostgREST RPC, so
  -- it bypasses RLS entirely — it must authorize itself rather than trusting
  -- RLS or any caller-supplied parameter. auth.role() reflects the JWT the
  -- caller actually presented and can't be forged by passing arguments.
  if auth.role() is distinct from 'service_role' and not public.is_staff() then
    raise exception 'insufficient privilege to adjust inventory';
  end if;

  insert into public.inventory_levels (variant_id, warehouse_id, quantity_on_hand)
  values (p_variant_id, p_warehouse_id, greatest(p_quantity_delta, 0))
  on conflict (variant_id, warehouse_id)
  do update set
    quantity_on_hand = public.inventory_levels.quantity_on_hand + p_quantity_delta,
    updated_at = now();

  insert into public.inventory_movements (
    variant_id, warehouse_id, quantity_delta, reason, reference_type, reference_id, note, created_by
  ) values (
    p_variant_id, p_warehouse_id, p_quantity_delta, p_reason, p_reference_type, p_reference_id, p_note, p_created_by
  );
end;
$$;

-- 7. Loyalty points: award on order completion --------------------------------

create or replace function public.award_loyalty_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  points_earned integer;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' and new.user_id is not null then
    points_earned := floor(new.total)::integer; -- 1 point per currency unit spent
    if points_earned > 0 then
      insert into public.loyalty_transactions (user_id, points, type, reference_type, reference_id, note)
      values (new.user_id, points_earned, 'earn', 'order', new.id, 'Points earned from order ' || new.order_number);

      update public.profiles
      set loyalty_points = loyalty_points + points_earned
      where id = new.user_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger orders_award_loyalty_points
  after update of status on public.orders
  for each row execute function public.award_loyalty_points();

-- 8. Lock down trigger-only functions -----------------------------------------
-- These are never meant to be called directly — triggers invoke them through
-- a separate internal calling convention that doesn't need EXECUTE granted to
-- API roles. Without this, PostgREST auto-exposes every one of them as a
-- public RPC endpoint (/rest/v1/rpc/<fn>).

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.products_search_vector_update() from public, anon, authenticated;
revoke execute on function public.set_order_number() from public, anon, authenticated;
revoke execute on function public.set_po_number() from public, anon, authenticated;
revoke execute on function public.refresh_product_rating() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.award_loyalty_points() from public, anon, authenticated;
