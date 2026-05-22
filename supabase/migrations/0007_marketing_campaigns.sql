-- RightHand Marketing Digital campaigns and assets.
-- Apply after 0006_business_offers.sql.

do $$
begin
  if to_regclass('public.businesses') is null
    or to_regnamespace('app_private') is null
  then
    raise exception
      'RightHand base schema is missing. Run migrations 0001 through 0006 first, then rerun 0007_marketing_campaigns.sql.';
  end if;
end $$;

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  campaign_goal text not null default 'ventas',
  audience text not null default '',
  offer_text text not null default '',
  instructions text not null default '',
  format_id text not null default 'instagram_post',
  image_url text not null default '',
  reference_image_urls text[] not null default '{}'::text[],
  captions text[] not null default '{}'::text[],
  hashtags text[] not null default '{}'::text[],
  canva_design_id text,
  canva_edit_url text,
  canva_view_url text,
  source text not null default 'right_hand',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table public.marketing_campaigns
    add constraint marketing_campaigns_format_check
    check (format_id in (
      'instagram_post',
      'instagram_story',
      'facebook_ad',
      'whatsapp_status',
      'flyer'
    ));
exception
  when duplicate_object then null;
end $$;

alter table public.marketing_campaigns enable row level security;

drop trigger if exists touch_marketing_campaigns_updated_at on public.marketing_campaigns;
create trigger touch_marketing_campaigns_updated_at
  before update on public.marketing_campaigns
  for each row execute function public.touch_updated_at();

create index if not exists idx_marketing_campaigns_business_created
  on public.marketing_campaigns(business_id, created_at desc);

drop policy if exists "marketing_campaigns_staff_select" on public.marketing_campaigns;
create policy "marketing_campaigns_staff_select" on public.marketing_campaigns
  for select using (
    app_private.is_business_member(
      business_id,
      array['owner','admin','sales']::public.business_role[]
    )
  );

drop policy if exists "marketing_campaigns_staff_write" on public.marketing_campaigns;
create policy "marketing_campaigns_staff_write" on public.marketing_campaigns
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

insert into storage.buckets (id, name, public)
values ('marketing-assets', 'marketing-assets', true)
on conflict (id) do nothing;

drop policy if exists "marketing_assets_public_read" on storage.objects;
create policy "marketing_assets_public_read" on storage.objects
  for select using (bucket_id = 'marketing-assets');

drop policy if exists "marketing_assets_staff_write" on storage.objects;
create policy "marketing_assets_staff_write" on storage.objects
  for all using (
    bucket_id = 'marketing-assets'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and app_private.is_business_member(
      split_part(name, '/', 1)::uuid,
      array['owner','admin','sales']::public.business_role[]
    )
  )
  with check (
    bucket_id = 'marketing-assets'
    and split_part(name, '/', 1) ~* '^[0-9a-f-]{36}$'
    and app_private.is_business_member(
      split_part(name, '/', 1)::uuid,
      array['owner','admin','sales']::public.business_role[]
    )
  );

grant select, insert, update, delete on public.marketing_campaigns to anon, authenticated;
