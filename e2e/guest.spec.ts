import { test, expect } from "@playwright/test";

/**
 * Guest are signed out. The chromium project ships an auth session by default, so we override it here
 * with an empty state for the whole file
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("guest", () => {
  test("can open the map home without being redirected to login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/"); // guest is allowed to browse the map read-only
  });

  test("sees the login form on /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  });

  test("sees the register link/form on /register", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
  });
});
