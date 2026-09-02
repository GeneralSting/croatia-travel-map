-- ─────────────────────────────────────────────────────────────────────────────
-- Reset USER DATA to a clean slate — the "get unstuck" button.
--
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → paste → Run) any time test runs have
-- left data behind and you want a clean state. It is safe and reversible:
--
--   • Removes ONLY user-generated rows: everyone's progress, county overrides, and custom POIs.
--   • KEEPS all reference/seed data: counties, cities, poi_types, and the default POIs
--     (owner_id IS NULL). The map still works immediately afterwards — nothing to re-seed.
--   • Does NOT touch auth.users (login accounts) unless you opt in at the bottom.
--
-- Wrapped in a transaction: if anything fails, nothing is deleted. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- Saved "visited / want to visit" status + ratings + notes, for every user and every POI.
delete from public.poi_progress;

-- Manual explored-% overrides per county.
delete from public.county_overrides;

-- User-created custom POIs. Defaults (owner_id IS NULL) are kept.
delete from public.pois where owner_id is not null;

commit;

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTIONAL — also delete a leftover test account. Deleting the auth user cascades away ALL of its
-- rows (custom POIs, progress, overrides, profile) via the ON DELETE CASCADE foreign keys, so this
-- alone is a complete per-user cleanup. Uncomment and set the email:
--
-- delete from auth.users where email = 'e2e-tester@croatia-explorer.test';
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- FULL REBUILD (only if you ever wipe reference data too): re-run supabase/schema.sql, then
-- supabase/seed.sql. That restores the entire default dataset from scratch.
-- ─────────────────────────────────────────────────────────────────────────────
