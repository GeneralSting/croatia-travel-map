-- Croatia Explorer — database schema.
-- Run once in the Supabase SQL editor: Dashboard → SQL Editor → New query → paste → Run.
-- Then run supabase/seed.sql to load the reference data (poi_types, counties, cities, default POIs).
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP … IF EXISTS).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Profiles — one row per auth user; holds the admin flag (for later /admin work).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Reference data — the canonical map data, shared by everyone (public read).
--    Seeded from supabase/seed.sql. Only the service role / SQL editor may write
--    (no insert/update/delete policies), so these are read-only to the app.
-- ─────────────────────────────────────────────────────────────────────────────

-- POI types (canonical values + labels). The frontend owns icon/color presentation.
create table if not exists public.poi_types (
  id         text primary key,
  label      text not null,
  sort_order smallint not null default 0
);

alter table public.poi_types enable row level security;
drop policy if exists "poi_types_read_all" on public.poi_types;
create policy "poi_types_read_all" on public.poi_types
  for select using (true);

-- Counties (metadata only; polygon geometry stays in public/geo/*.geojson).
create table if not exists public.counties (
  id   text primary key,
  name text not null
);

alter table public.counties enable row level security;
drop policy if exists "counties_read_all" on public.counties;
create policy "counties_read_all" on public.counties
  for select using (true);

-- Cities (clickable, zoom-revealed places with their own detail drawer).
create table if not exists public.cities (
  id          text primary key,
  county_id   text not null references public.counties(id) on delete cascade,
  name        text not null,
  lat         double precision not null,
  lng         double precision not null,
  importance  smallint not null default 3 check (importance between 1 and 3),
  description text,
  cover_image text
);

alter table public.cities enable row level security;
drop policy if exists "cities_read_all" on public.cities;
create policy "cities_read_all" on public.cities
  for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) POIs — unified table for BOTH the shared default POIs and each user's custom
--    ones. owner_id IS NULL → a default POI (everyone sees it); owner_id = <user>
--    → a private custom POI. RLS enforces the split.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.pois (
  id          text primary key,
  owner_id    uuid references auth.users(id) on delete cascade, -- NULL = shared default
  county_id   text not null references public.counties(id) on delete cascade,
  city_id     text references public.cities(id) on delete set null,
  name        text not null,
  type        text not null references public.poi_types(id),
  description text,
  -- Nullable: a default POI attached to a city can be a list-only entry with no map position.
  -- Custom POIs always carry coordinates (the user drops the pin). Mapped POIs are those with both.
  lat         double precision,
  lng         double precision,
  created_at  timestamptz not null default now()
);

create index if not exists pois_owner_id_idx on public.pois (owner_id);
create index if not exists pois_county_id_idx on public.pois (county_id);
create index if not exists pois_city_id_idx on public.pois (city_id);

alter table public.pois enable row level security;

-- Read: shared defaults for everyone + your own custom POIs.
drop policy if exists "pois_select_visible" on public.pois;
create policy "pois_select_visible" on public.pois
  for select using (owner_id is null or auth.uid() = owner_id);

-- Write: only your own custom POIs (owner_id must equal you — blocks creating defaults).
drop policy if exists "pois_insert_own" on public.pois;
create policy "pois_insert_own" on public.pois
  for insert with check (auth.uid() = owner_id);

drop policy if exists "pois_update_own" on public.pois;
create policy "pois_update_own" on public.pois
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "pois_delete_own" on public.pois;
create policy "pois_delete_own" on public.pois
  for delete using (auth.uid() = owner_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) POI progress — a user's status / rating / notes per POI (default or custom).
--    poi_id references pois(id) — the two id namespaces are unified there.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.poi_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  poi_id       text not null,
  status       text not null default 'not_visited'
               check (status in ('not_visited','want_to_visit','visited')),
  rating       smallint check (rating between 0 and 5),
  date_visited date,
  notes        text,
  updated_at   timestamptz not null default now(),
  primary key (user_id, poi_id)
);

-- Add the FK to pois idempotently (constraints don't support IF NOT EXISTS directly).
-- NOT VALID: pois is still empty when schema.sql runs (seed.sql runs after), and there may be
-- leftover poi_progress rows from an earlier setup. NOT VALID applies the constraint without
-- checking existing rows, while still enforcing every new insert/update. seed.sql cleans any
-- orphans and runs VALIDATE CONSTRAINT once pois is populated.
alter table public.poi_progress drop constraint if exists poi_progress_poi_id_fkey;
alter table public.poi_progress
  add constraint poi_progress_poi_id_fkey
  foreign key (poi_id) references public.pois(id) on delete cascade not valid;

alter table public.poi_progress enable row level security;

drop policy if exists "poi_progress_select_own" on public.poi_progress;
create policy "poi_progress_select_own" on public.poi_progress
  for select using (auth.uid() = user_id);

drop policy if exists "poi_progress_insert_own" on public.poi_progress;
create policy "poi_progress_insert_own" on public.poi_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "poi_progress_update_own" on public.poi_progress;
create policy "poi_progress_update_own" on public.poi_progress
  for update using (auth.uid() = user_id);

drop policy if exists "poi_progress_delete_own" on public.poi_progress;
create policy "poi_progress_delete_own" on public.poi_progress
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) County overrides — a user's manual explored-% override per county.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.county_overrides (
  user_id         uuid not null references auth.users(id) on delete cascade,
  county_id       text not null,
  visited_percent smallint check (visited_percent between 0 and 100),
  is_manual       boolean not null default true,
  updated_at      timestamptz not null default now(),
  primary key (user_id, county_id)
);

alter table public.county_overrides enable row level security;

drop policy if exists "county_overrides_select_own" on public.county_overrides;
create policy "county_overrides_select_own" on public.county_overrides
  for select using (auth.uid() = user_id);

drop policy if exists "county_overrides_insert_own" on public.county_overrides;
create policy "county_overrides_insert_own" on public.county_overrides
  for insert with check (auth.uid() = user_id);

drop policy if exists "county_overrides_update_own" on public.county_overrides;
create policy "county_overrides_update_own" on public.county_overrides
  for update using (auth.uid() = user_id);

drop policy if exists "county_overrides_delete_own" on public.county_overrides;
create policy "county_overrides_delete_own" on public.county_overrides
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) Retire the old per-user table — custom POIs now live in public.pois.
-- ─────────────────────────────────────────────────────────────────────────────
drop table if exists public.user_pois;
