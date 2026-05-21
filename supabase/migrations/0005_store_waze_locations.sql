-- RightHand physical store locations for Waze navigation.
-- Apply after 0004_business_discovery_profile.sql.

do $$
begin
  if to_regclass('public.stores') is null then
    raise exception
      'RightHand stores table is missing. Run migrations 0001 through 0004 first, then rerun 0005_store_waze_locations.sql.';
  end if;
end $$;

alter table public.stores
  add column if not exists physical_address text not null default 'Costa Rica',
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7);

do $$
begin
  alter table public.stores
    add constraint stores_latitude_range_check
    check (latitude is null or (latitude >= -90 and latitude <= 90));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.stores
    add constraint stores_longitude_range_check
    check (longitude is null or (longitude >= -180 and longitude <= 180));
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_stores_location_coordinates
  on public.stores(latitude, longitude)
  where latitude is not null and longitude is not null;

update public.stores
set
  physical_address = 'San Pedro de Montes de Oca, San Jose, Costa Rica',
  latitude = 9.9329000,
  longitude = -84.0508000
where slug = 'soda-luna';

update public.stores
set
  physical_address = 'Centro de Escazu, San Jose, Costa Rica',
  latitude = 9.9361000,
  longitude = -84.1372000
where slug = 'moda-tica';

update public.stores
set
  physical_address = 'Rohrmoser, frente a Plaza Mayor, San Jose, Costa Rica',
  latitude = 9.9431000,
  longitude = -84.1256000
where slug = 'farma-central';

