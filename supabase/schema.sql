-- Croatia Explorer — database schema for per-user travel progress.
-- Run once in the Supabase SQL editor: Dashboard → SQL Editor → New query → paste → Run.
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
-- 2) POI progress — a user's status / rating / notes per point of interest.
--    poi_id is our string id (e.g. "diocletian-palace").
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
-- 3) County overrides — a user's manual explored-% override per county.
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
