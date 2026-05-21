-- RightHand public business discovery profile.
-- Apply after 0003_subscription_entitlements.sql.

do $$
begin
  if to_regclass('public.businesses') is null
    or to_regclass('public.business_members') is null
    or to_regclass('public.stores') is null
  then
    raise exception
      'RightHand base schema is missing. Run migrations 0001 through 0003 first, then rerun 0004_business_discovery_profile.sql.';
  end if;
end $$;

alter table public.businesses
  add column if not exists province text not null default 'San Jose',
  add column if not exists city text not null default 'San Jose',
  add column if not exists business_category text not null default 'pyme',
  add column if not exists business_style text not null default 'Negocio local',
  add column if not exists offer_summary text not null default 'Productos y servicios locales.',
  add column if not exists search_tags text[] not null default '{}'::text[];

do $$
begin
  alter table public.businesses
    add constraint businesses_business_category_check
    check (business_category in ('restaurante', 'tienda', 'pyme', 'farmacia'));
exception
  when duplicate_object then null;
end $$;

alter table public.businesses
  add column if not exists search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(city, '') || ' ' || coalesce(province, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(business_style, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(offer_summary, '')), 'C') ||
    setweight(to_tsvector('simple', array_to_string(search_tags, ' ')), 'C')
  ) stored;

create index if not exists idx_businesses_location_category
  on public.businesses(province, city, business_category);

create index if not exists idx_businesses_search_vector
  on public.businesses using gin(search_vector);

update public.businesses
set
  province = 'San Jose',
  city = 'San Pedro',
  business_category = 'restaurante',
  business_style = 'Comida casera costarricense',
  offer_summary = 'Casados, chifrijos, frescos naturales y almuerzos ejecutivos para oficina.',
  search_tags = array['soda', 'casados', 'almuerzos', 'express', 'comida tica']
where slug = 'soda-luna';

update public.businesses
set
  province = 'San Jose',
  city = 'Escazu',
  business_category = 'tienda',
  business_style = 'Ropa casual femenina',
  offer_summary = 'Blusas, jeans, basicos y outfits casuales con cambios coordinados.',
  search_tags = array['ropa', 'moda', 'blusas', 'jeans', 'outfits']
where slug = 'moda-tica';

update public.businesses
set
  province = 'San Jose',
  city = 'Rohrmoser',
  business_category = 'farmacia',
  business_style = 'Farmacia de barrio',
  offer_summary = 'Medicamentos, vitaminas, cuidado personal y entregas programadas.',
  search_tags = array['farmacia', 'vitaminas', 'medicamentos', 'salud', 'entrega']
where slug = 'farma-central';

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
  profile_province text := coalesce(nullif(new.raw_user_meta_data ->> 'province', ''), 'San Jose');
  profile_city text := coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'San Jose');
  profile_category text := coalesce(nullif(new.raw_user_meta_data ->> 'business_category', ''), 'pyme');
  profile_style text := coalesce(nullif(new.raw_user_meta_data ->> 'business_style', ''), 'Negocio local');
  profile_offer text := coalesce(nullif(new.raw_user_meta_data ->> 'offer_summary', ''), 'Productos y servicios locales.');
  profile_tags text[] := coalesce(
    array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data -> 'search_tags', '[]'::jsonb))),
    '{}'::text[]
  );
begin
  if lower(coalesce(new.email, '')) = owner_email then
    starter_plan := 'pro';
  end if;

  if profile_category not in ('restaurante', 'tienda', 'pyme', 'farmacia') then
    profile_category := 'pyme';
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
    set
      plan = case when lower(coalesce(new.email, '')) = owner_email then starter_plan else b.plan end,
      province = profile_province,
      city = profile_city,
      business_category = profile_category,
      business_style = profile_style,
      offer_summary = profile_offer,
      search_tags = profile_tags
    where exists (
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

  insert into public.businesses (
    name,
    slug,
    email,
    plan,
    province,
    city,
    business_category,
    business_style,
    offer_summary,
    search_tags
  )
  values (
    business_name,
    business_slug,
    lower(coalesce(new.email, '')),
    starter_plan,
    profile_province,
    profile_city,
    profile_category,
    profile_style,
    profile_offer,
    profile_tags
  )
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
    profile_offer,
    '#103A5C',
    '#219E6B',
    '#F97316',
    '{}'::jsonb,
    false
  );

  return new;
end;
$$;
