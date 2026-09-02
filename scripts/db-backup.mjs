// Snapshot the current database DATA to a timestamped SQL file — a real backup you can restore.
//
// Run with:  pnpm db:backup
// Restore with (careful — overwrites current data):
//            psql "$SUPABASE_DB_URL" -f supabase/backups/<file>.sql
//
// This dumps DATA only (schema already lives in supabase/schema.sql), using the Supabase CLI's
// `db dump`. It needs a direct Postgres connection string in SUPABASE_DB_URL — Dashboard → Project
// Settings → Database → Connection string (URI). Keep that string secret; it is NOT committed.
//
// Note: this is the belt-and-suspenders option. The e2e tests already clean up after themselves by
// deleting their throwaway user (which cascades all its data away), and supabase/reset.sql clears
// user data on demand — so a manual backup is only for extra peace of mind before a big test run.

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(resolve(root, ".env.local"));

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  fail(
    "SUPABASE_DB_URL is not set. Copy the URI connection string from Supabase →\n" +
      "Project Settings → Database → Connection string, then add it to .env.local:\n" +
      "  SUPABASE_DB_URL=postgresql://postgres:[password]@db.<ref>.supabase.co:5432/postgres",
  );
}

const dir = resolve(root, "supabase/backups");
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = resolve(dir, `data-${stamp}.sql`);

console.log(`Backing up data → ${rel(out)} …`);

const result = spawnSync(
  "npx",
  ["--yes", "supabase", "db", "dump", "--db-url", dbUrl, "--data-only", "-f", out],
  { encoding: "utf8", stdio: "inherit", env: process.env },
);

if (result.status !== 0) fail(`supabase db dump exited with code ${result.status}`);
console.log(`✓ Backup written to ${rel(out)}`);

// ── helpers ──────────────────────────────────────────────────────────────────────────────────
function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
function rel(p) {
  return p.replace(`${root}/`, "");
}
function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}
