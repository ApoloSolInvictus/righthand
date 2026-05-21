-- RightHand business offers for landing and public store profiles.
-- Apply after 0005_store_waze_locations.sql.

do $$
begin
  if to_regclass('public.businesses') is null
    or to_regclass('public.stores') is null
    or to_regnamespace('app_private') is null
  then
    raise exception
      'RightHand base schema is missing. Run migrations 0001 through 0005 first, then rerun 0006_business_offers.sql.';
  end if;
end $$;

create table if not exists public.business_offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text not null,
  image_url text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_offers enable row level security;

drop trigger if exists touch_business_offers_updated_at on public.business_offers;
create trigger touch_business_offers_updated_at
  before update on public.business_offers
  for each row execute function public.touch_updated_at();

create index if not exists idx_business_offers_business_active
  on public.business_offers(business_id, active, sort_order);

drop policy if exists "business_offers_member_or_public_select" on public.business_offers;
create policy "business_offers_member_or_public_select" on public.business_offers
  for select using (
    app_private.is_business_member(business_id)
    or (
      active
      and exists (
        select 1
        from public.stores s
        where s.business_id = business_offers.business_id
          and s.is_published
      )
    )
  );

drop policy if exists "business_offers_staff_write" on public.business_offers;
create policy "business_offers_staff_write" on public.business_offers
  for all using (
    app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  )
  with check (
    app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  );

grant select, insert, update, delete on public.business_offers to anon, authenticated;
