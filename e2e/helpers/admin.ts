import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./env";
import { TEST_USER } from "./test-user";

/**
 * Privileged Supabase client using the SERVICE ROLE key. It bypasses RLS and can manage auth users - powerful,
 * so it is used only by E2E setup/teardown, never by the app. The key lives in .env.local.
 * This is what lets tests create a confirmed user and, crucially, delete it afterwards so nothing
 * is left behind in the database
 */
export function createAdminClient(): SupabaseClient {
  loadEnv();
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// Create the test user if absent, pre-confirmed so the login flow works without an email link
export async function ensureTestUser(): Promise<string> {
  const admin = createAdminClient();
  const existing = await findTestUser(admin);
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user) throw new Error("createUser returned no user");
  return data.user.id;
}

/**
 * Delete the test user. Thanks to ON DELETE CASCADE on pois.owner_id / poi_progress.user_id /
 * county_overrides.user_id / profiles.id, this single call removes every row the tests created —
 * the whole cleanup, guaranteed, leaving the database exactly as it was
 */
export async function deleteTestUser(): Promise<void> {
  const admin = createAdminClient();
  const user = await findTestUser(admin);
  if (user) await admin.auth.admin.deleteUser(user.id);
}

async function findTestUser(admin: SupabaseClient) {
  // listUsers is paginated; the dev DB is small, so the first page is plenty
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  return data.users.find((user) => user.email === TEST_USER.email) ?? null;
}
