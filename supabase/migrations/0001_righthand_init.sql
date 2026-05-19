-- RightHand MVP schema for Supabase Postgres.
-- Apply in Supabase SQL Editor or via Supabase CLI migrations.

create extension if not exists pgcrypto;

create schema if not exists app_private;

do $$
begin
  create type public.business_role as enum ('owner', 'admin', 'sales', 'courier');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum (
    'new',
    'confirmed',
    'preparing',
    'ready_for_delivery',
    'in_route',
    'delivered',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.delivery_status as enum ('assigned', 'picked_up', 'delivered', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_plan as enum ('free', 'pyme', 'pro', 'enterprise');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  primary_business_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  tax_id text,
  phone text,
  email text,
  timezone text not null default 'America/Costa_Rica',
  plan public.subscription_plan not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_primary_business_id_fkey
  foreign key (primary_business_id) references public.businesses(id)
  on delete set null;

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.business_role not null default 'sales',
  invited_email text,
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  cover_url text,
  primary_color text not null default '#103A5C',
  success_color text not null default '#219E6B',
  delivery_color text not null default '#F97316',
  hours jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  price numeric(12, 2) not null check (price >= 0),
  cost numeric(12, 2) not null default 0 check (cost >= 0),
  stock integer not null default 0 check (stock >= 0),
  sku text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  birthday date,
  total_orders integer not null default 0,
  total_spent numeric(12, 2) not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  public_tracking_code text not null unique default upper('RH-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  status public.order_status not null default 'new',
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_lat numeric(10, 7),
  delivery_lng numeric(10, 7),
  zone_name text,
  subtotal numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  promised_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  fee numeric(12, 2) not null default 0,
  eta_minutes integer not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.couriers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  zone text,
  available boolean not null default false,
  commission_per_delivery numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  courier_id uuid references public.couriers(id) on delete set null,
  status public.delivery_status not null default 'assigned',
  pickup_address text,
  dropoff_address text not null,
  dropoff_lat numeric(10, 7),
  dropoff_lng numeric(10, 7),
  proof_photo_url text,
  assigned_at timestamptz default now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  event_type text not null,
  notes text,
  photo_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_tags (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  unique (business_id, customer_id, tag)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  paypal_subscription_id text unique,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  prompt jsonb not null,
  response jsonb not null,
  model text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function app_private.is_business_member(
  target_business_id uuid,
  allowed_roles public.business_role[] default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = target_business_id
      and bm.user_id = auth.uid()
      and (allowed_roles is null or bm.role = any(allowed_roles))
  );
$$;

create or replace function app_private.is_courier_for_business(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.couriers c
    where c.business_id = target_business_id
      and c.user_id = auth.uid()
  );
$$;

create or replace function app_private.is_assigned_delivery(target_delivery_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.deliveries d
    join public.couriers c on c.id = d.courier_id
    where d.id = target_delivery_id
      and c.user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','businesses','stores','products','customers','orders',
    'couriers','deliveries','subscriptions'
  ]
  loop
    execute format('drop trigger if exists touch_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger touch_%I_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

create index if not exists idx_business_members_user on public.business_members(user_id);
create index if not exists idx_stores_business on public.stores(business_id);
create index if not exists idx_products_business on public.products(business_id);
create index if not exists idx_customers_business_phone on public.customers(business_id, phone);
create index if not exists idx_orders_business_status on public.orders(business_id, status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_deliveries_courier on public.deliveries(courier_id);
create index if not exists idx_ai_logs_business_created on public.ai_logs(business_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.stores enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.couriers enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_events enable row level security;
alter table public.crm_notes enable row level security;
alter table public.customer_tags enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_logs enable row level security;

create policy "profiles_own_select" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_own_insert" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_own_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "businesses_member_or_public_store_select" on public.businesses
  for select using (
    app_private.is_business_member(id)
    or exists (select 1 from public.stores s where s.business_id = businesses.id and s.is_published)
  );
create policy "businesses_authenticated_insert" on public.businesses
  for insert to authenticated with check (true);
create policy "businesses_owner_admin_update" on public.businesses
  for update using (app_private.is_business_member(id, array['owner','admin']::public.business_role[]))
  with check (app_private.is_business_member(id, array['owner','admin']::public.business_role[]));

create policy "business_members_member_select" on public.business_members
  for select using (app_private.is_business_member(business_id));
create policy "business_members_owner_admin_insert" on public.business_members
  for insert with check (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));
create policy "business_members_owner_admin_update" on public.business_members
  for update using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));
create policy "business_members_owner_admin_delete" on public.business_members
  for delete using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));

create policy "stores_member_or_published_select" on public.stores
  for select using (is_published or app_private.is_business_member(business_id));
create policy "stores_owner_admin_write" on public.stores
  for all using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));

create policy "categories_member_or_published_select" on public.product_categories
  for select using (
    app_private.is_business_member(business_id)
    or exists (select 1 from public.stores s where s.business_id = product_categories.business_id and s.is_published)
  );
create policy "categories_staff_write" on public.product_categories
  for all using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));

create policy "products_member_or_published_select" on public.products
  for select using (
    app_private.is_business_member(business_id)
    or (
      active
      and exists (select 1 from public.stores s where s.business_id = products.business_id and s.is_published)
    )
  );
create policy "products_staff_write" on public.products
  for all using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));

create policy "customers_staff_select" on public.customers
  for select using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));
create policy "customers_staff_write" on public.customers
  for all using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));

create policy "orders_staff_or_courier_select" on public.orders
  for select using (
    app_private.is_business_member(business_id)
    or exists (
      select 1
      from public.deliveries d
      join public.couriers c on c.id = d.courier_id
      where d.order_id = orders.id
        and c.user_id = auth.uid()
    )
  );
create policy "orders_public_insert" on public.orders
  for insert to anon, authenticated with check (
    status = 'new'
    and exists (select 1 from public.stores s where s.business_id = orders.business_id and s.is_published)
  );
create policy "orders_staff_update" on public.orders
  for update using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));

create policy "order_items_staff_or_courier_select" on public.order_items
  for select using (
    app_private.is_business_member(business_id)
    or exists (
      select 1
      from public.orders o
      join public.deliveries d on d.order_id = o.id
      join public.couriers c on c.id = d.courier_id
      where o.id = order_items.order_id
        and c.user_id = auth.uid()
    )
  );
create policy "order_items_public_insert" on public.order_items
  for insert to anon, authenticated with check (
    exists (
      select 1
      from public.orders o
      join public.stores s on s.business_id = o.business_id
      where o.id = order_items.order_id
        and o.business_id = order_items.business_id
        and s.is_published
    )
  );
create policy "order_items_staff_write" on public.order_items
  for all using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));

create policy "delivery_zones_member_or_public_select" on public.delivery_zones
  for select using (
    active
    and (
      app_private.is_business_member(business_id)
      or exists (select 1 from public.stores s where s.business_id = delivery_zones.business_id and s.is_published)
    )
  );
create policy "delivery_zones_admin_write" on public.delivery_zones
  for all using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));

create policy "couriers_member_or_self_select" on public.couriers
  for select using (app_private.is_business_member(business_id) or user_id = auth.uid());
create policy "couriers_admin_write" on public.couriers
  for all using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));
create policy "couriers_self_availability_update" on public.couriers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "deliveries_member_or_assigned_select" on public.deliveries
  for select using (app_private.is_business_member(business_id) or app_private.is_assigned_delivery(id));
create policy "deliveries_staff_insert" on public.deliveries
  for insert with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));
create policy "deliveries_staff_or_assigned_update" on public.deliveries
  for update using (
    app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[])
    or app_private.is_assigned_delivery(id)
  )
  with check (
    app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[])
    or app_private.is_assigned_delivery(id)
  );

create policy "delivery_events_member_or_courier_select" on public.delivery_events
  for select using (
    app_private.is_business_member(business_id)
    or exists (select 1 from public.deliveries d where d.id = delivery_events.delivery_id and app_private.is_assigned_delivery(d.id))
  );
create policy "delivery_events_member_or_courier_insert" on public.delivery_events
  for insert with check (
    app_private.is_business_member(business_id)
    or exists (select 1 from public.deliveries d where d.id = delivery_events.delivery_id and app_private.is_assigned_delivery(d.id))
  );

create policy "crm_notes_staff_select" on public.crm_notes
  for select using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));
create policy "crm_notes_staff_write" on public.crm_notes
  for all using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));

create policy "customer_tags_staff_select" on public.customer_tags
  for select using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));
create policy "customer_tags_staff_write" on public.customer_tags
  for all using (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin','sales']::public.business_role[]));

create policy "subscriptions_owner_admin_select" on public.subscriptions
  for select using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));
create policy "subscriptions_owner_admin_write" on public.subscriptions
  for all using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]))
  with check (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));

create policy "ai_logs_owner_admin_select" on public.ai_logs
  for select using (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));
create policy "ai_logs_owner_admin_insert" on public.ai_logs
  for insert with check (app_private.is_business_member(business_id, array['owner','admin']::public.business_role[]));

insert into storage.buckets (id, name, public)
values
  ('store-assets', 'store-assets', true),
  ('delivery-proofs', 'delivery-proofs', false)
on conflict (id) do nothing;

create policy "store_assets_public_read" on storage.objects
  for select using (bucket_id = 'store-assets');
create policy "store_assets_member_write" on storage.objects
  for all using (
    bucket_id = 'store-assets'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and app_private.is_business_member(split_part(name, '/', 1)::uuid, array['owner','admin','sales']::public.business_role[])
  )
  with check (
    bucket_id = 'store-assets'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and app_private.is_business_member(split_part(name, '/', 1)::uuid, array['owner','admin','sales']::public.business_role[])
  );
create policy "delivery_proofs_member_or_courier_read" on storage.objects
  for select using (
    bucket_id = 'delivery-proofs'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and (
      app_private.is_business_member(split_part(name, '/', 1)::uuid)
      or app_private.is_courier_for_business(split_part(name, '/', 1)::uuid)
    )
  );
create policy "delivery_proofs_courier_write" on storage.objects
  for insert with check (
    bucket_id = 'delivery-proofs'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and (
      app_private.is_business_member(split_part(name, '/', 1)::uuid)
      or app_private.is_courier_for_business(split_part(name, '/', 1)::uuid)
    )
  );

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on schema app_private to authenticated;
grant execute on all functions in schema app_private to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
