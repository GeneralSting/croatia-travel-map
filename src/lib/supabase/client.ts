import { createBrowserClient } from "@supabase/ssr";

// True once the Supabase env vars are present. Lets the app run (and hide auth UI)
// before setup, instead of crashing on an empty client. Inlined at build time.
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser-side Supabase client (Client Components). The anon key is safe to expose —
// access is governed by Row-Level Security on the database.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
