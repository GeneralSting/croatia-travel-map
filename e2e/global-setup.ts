import { ensureTestUser } from "./helpers/admin";

/**
 * Runs once before the whole E2E run: make sure the confirmed throwaway account exists, so the login flow
 * (auth.setup.ts) can sign in without an email-confirmation step
 */
export default async function globalSetup() {
  await ensureTestUser();
}
