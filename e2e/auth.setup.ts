import { test as setup } from "@playwright/test";
import { TEST_USER } from "./helpers/test-user";

/**
 * Playwright setup project (playwright.config.ts): it logs in once through the real UI and saves the
 * resulting browser session (Supabase auth cookies) to a file. Every authenticated spec then reuses that
 * saved state instead of logging in again - faster, and it exercises the real cookie-based session
 */
const AUTH_FILE = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(TEST_USER.email);
  // `exact` so "Password" doesn't also match the "Show password" toggle button next to the field
  await page.getByLabel("Password", { exact: true }).fill(TEST_USER.password);
  await page.getByRole("button", { name: /login/i }).click();

  // A successful login redirects to the map home; wait for it before saving the session
  await page.waitForURL("/");
  await page.context().storageState({ path: AUTH_FILE });
});
