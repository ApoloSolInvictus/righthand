-- RightHand subscription entitlement defaults.
-- Apply after 0001_righthand_init.sql and 0002_accounting_invoices.sql.

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.businesses') is null
    or to_regclass('public.business_members') is null
    or to_regclass('public.profiles') is null
    or to_regclass('public.stores') is null
    or to_regclass('public.subscriptions') is null
  then
    raise exception
      'RightHand base schema is missing. Run 0001_righthand_init.sql first, then rerun 0003_subscription_entitlements.sql.';
  end if;
end $$;

create index if not exists idx_subscriptions_paypal_subscription_id
  on public.subscriptions(paypal_subscription_id);

create index if not exists idx_subscriptions_business_status
  on public.subscriptions(business_id, status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  owner_email constant text := 'ronnywoods77@gmail.com';
  business_name text := coalesce(nullif(new.raw_user_meta_data ->> 'business_name', ''), 'Mi tienda');
  slug_base text;
  business_slug text;
  created_business_id uuid;
  starter_plan public.subscription_plan := 'free';
begin
  if lower(coalesce(new.email, '')) = owner_email then
    starter_plan := 'pro';
  end if;

  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        avatar_url = excluded.avatar_url;

  if exists (select 1 from public.business_members where user_id = new.id) then
    update public.businesses b
    set plan = starter_plan
    where lower(coalesce(new.email, '')) = owner_email
      and exists (
        select 1
        from public.business_members bm
        where bm.business_id = b.id
          and bm.user_id = new.id
      );

    return new;
  end if;

  slug_base := trim(both '-' from regexp_replace(lower(business_name), '[^a-z0-9]+', '-', 'g'));

  if slug_base = '' then
    slug_base := 'tienda';
  end if;

  business_slug := slug_base || '-' || substr(new.id::text, 1, 8);

  insert into public.businesses (name, slug, email, plan)
  values (business_name, business_slug, lower(coalesce(new.email, '')), starter_plan)
  returning id into created_business_id;

  insert into public.business_members (business_id, user_id, role)
  values (created_business_id, new.id, 'owner');

  update public.profiles
  set primary_business_id = created_business_id
  where id = new.id;

  insert into public.stores (
    business_id,
    slug,
    name,
    description,
    primary_color,
    success_color,
    delivery_color,
    hours,
    is_published
  )
  values (
    created_business_id,
    business_slug,
    business_name,
    'Tienda creada en RightHand.',
    '#103A5C',
    '#219E6B',
    '#F97316',
    '{}'::jsonb,
    false
  );

  return new;
end;
$$;

update public.subscriptions
set status = lower(status)
where status <> lower(status);

with active_paid_subscriptions as (
  select distinct on (business_id)
    business_id,
    plan
  from public.subscriptions
  where lower(status) in ('active', 'approval_pending', 'approved')
    and plan in ('pyme', 'pro', 'enterprise')
  order by business_id, updated_at desc
)
update public.businesses b
set plan = 'free'
where lower(coalesce(b.email, '')) <> 'ronnywoods77@gmail.com'
  and not exists (
    select 1
    from active_paid_subscriptions s
    where s.business_id = b.id
  );

with active_paid_subscriptions as (
  select distinct on (business_id)
    business_id,
    plan
  from public.subscriptions
  where lower(status) in ('active', 'approval_pending', 'approved')
    and plan in ('pyme', 'pro', 'enterprise')
  order by business_id, updated_at desc
)
update public.businesses b
set plan = s.plan
from active_paid_subscriptions s
where s.business_id = b.id;

update public.businesses
set plan = 'pro'
where lower(coalesce(email, '')) = 'ronnywoods77@gmail.com';
