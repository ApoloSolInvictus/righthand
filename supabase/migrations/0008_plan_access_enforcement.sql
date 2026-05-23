-- RightHand plan access enforcement.
-- Apply after 0007_marketing_campaigns.sql.

do $$
begin
  if to_regclass('public.businesses') is null
    or to_regclass('public.products') is null
    or to_regclass('public.marketing_campaigns') is null
    or to_regnamespace('app_private') is null
  then
    raise exception
      'RightHand schema is missing. Run migrations 0001 through 0007 first, then rerun 0008_plan_access_enforcement.sql.';
  end if;
end $$;

create or replace function app_private.plan_rank(target_plan public.subscription_plan)
returns integer
language sql
immutable
as $$
  select case target_plan
    when 'free' then 0
    when 'pyme' then 1
    when 'pro' then 2
    when 'enterprise' then 3
    else 0
  end;
$$;

create or replace function app_private.business_meets_plan(
  target_business_id uuid,
  minimum_plan public.subscription_plan
)
returns boolean
language sql
stable
security definer
set search_path = public, app_private
as $$
  select coalesce((
    select app_private.plan_rank(b.plan) >= app_private.plan_rank(minimum_plan)
    from public.businesses b
    where b.id = target_business_id
  ), false);
$$;

create or replace function app_private.prevent_client_plan_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text := current_setting('request.jwt.claim.role', true);
begin
  if old.plan is distinct from new.plan
    and coalesce(jwt_role, '') in ('anon', 'authenticated')
  then
    raise exception
      'El plan se actualiza solo por RightHand Billing, PayPal webhook o un administrador de base de datos.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_client_plan_change on public.businesses;
create trigger prevent_client_plan_change
  before update of plan on public.businesses
  for each row execute function app_private.prevent_client_plan_change();

create or replace function app_private.enforce_free_product_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  business_plan public.subscription_plan;
  active_product_count integer;
begin
  select b.plan
    into business_plan
  from public.businesses b
  where b.id = new.business_id;

  if business_plan = 'free' and coalesce(new.active, true) then
    select count(*)
      into active_product_count
    from public.products p
    where p.business_id = new.business_id
      and p.active
      and p.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if active_product_count >= 20 then
      raise exception
        'Plan Gratis permite hasta 20 productos activos. Active PYME o Pro para productos ilimitados.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_product_limit on public.products;
create trigger enforce_free_product_limit
  before insert or update of business_id, active on public.products
  for each row execute function app_private.enforce_free_product_limit();

drop policy if exists "marketing_campaigns_staff_select" on public.marketing_campaigns;
create policy "marketing_campaigns_staff_select" on public.marketing_campaigns
  for select
  to authenticated
  using (
    app_private.business_meets_plan(business_id, 'pyme')
    and app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  );

drop policy if exists "marketing_campaigns_staff_write" on public.marketing_campaigns;
create policy "marketing_campaigns_staff_write" on public.marketing_campaigns
  for all
  to authenticated
  using (
    app_private.business_meets_plan(business_id, 'pyme')
    and app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  )
  with check (
    app_private.business_meets_plan(business_id, 'pyme')
    and app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  );

drop policy if exists "marketing_assets_staff_write" on storage.objects;
create policy "marketing_assets_staff_write" on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'marketing-assets'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and app_private.business_meets_plan(split_part(name, '/', 1)::uuid, 'pyme')
    and app_private.is_business_member(
      split_part(name, '/', 1)::uuid,
      array['owner','admin','sales']::public.business_role[]
    )
  )
  with check (
    bucket_id = 'marketing-assets'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and app_private.business_meets_plan(split_part(name, '/', 1)::uuid, 'pyme')
    and app_private.is_business_member(
      split_part(name, '/', 1)::uuid,
      array['owner','admin','sales']::public.business_role[]
    )
  );

grant execute on function app_private.plan_rank(public.subscription_plan) to authenticated;
grant execute on function app_private.business_meets_plan(uuid, public.subscription_plan) to authenticated;
