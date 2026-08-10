// Regenerate src/lib/supabase/database.types.ts from the live Supabase database.
//
// Run with:  pnpm gen:types
//
// The Supabase CLI reads the database and emits the typed `Database` schema. This wrapper keeps the
// invocation reproducible across machines/CI: it resolves the project ref from your env (either
// SUPABASE_PROJECT_ID directly, or parsed out of NEXT_PUBLIC_SUPABASE_URL) so no one has to remember
// the ref, and it writes the output to the single canonical location the clients import from.
//
// Auth: reaching the cloud project needs a personal access token in SUPABASE_ACCESS_TOKEN
// (Supabase dashboard → Account → Access Tokens). Generating from a *local* stack instead? swap the
// args below for `gen types typescript --local`.
//
// The types file is a generated artifact — commit it, but never edit it by hand.

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(root, "src/lib/supabase/database.types.ts");

// Load env from .env.local (dev) or .env if present, without adding a dependency.
loadEnv(resolve(root, ".env.local"));
loadEnv(resolve(root, ".env"));

const projectRef = resolveProjectRef();
if (!projectRef) {
  fail(
    "Could not determine the Supabase project ref. Set SUPABASE_PROJECT_ID, or\n" +
      "NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co in your env / .env.local.",
  );
}
if (!process.env.SUPABASE_ACCESS_TOKEN) {
  fail(
    "SUPABASE_ACCESS_TOKEN is not set. Create one at Supabase → Account → Access Tokens,\n" +
      "then: export SUPABASE_ACCESS_TOKEN=... (or add it to .env.local).",
  );
}

console.log(`Generating ${rel(OUT)} from project ${projectRef} …`);

const result = spawnSync(
  "npx",
  [
    "--yes",
    "supabase",
    "gen",
    "types",
    "typescript",
    "--project-id",
    projectRef,
    "--schema",
    "public",
  ],
  { encoding: "utf8", env: process.env },
);

if (result.status !== 0) {
  fail(result.stderr || `supabase CLI exited with code ${result.status}`);
}

writeFileSync(OUT, result.stdout);
console.log(`✓ Wrote ${rel(OUT)}`);

// ── helpers ──────────────────────────────────────────────────────────────────────────────────
function resolveProjectRef() {
  if (process.env.SUPABASE_PROJECT_ID) return process.env.SUPABASE_PROJECT_ID;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const match = url?.match(/^https?:\/\/([^.]+)\.supabase\./);
  return match?.[1];
}

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trimStart().startsWith("#")) continue;
    const key = m[1];
    if (process.env[key] === undefined) {
      process.env[key] = m[2].replace(/^["']|["']$/g, "");
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
