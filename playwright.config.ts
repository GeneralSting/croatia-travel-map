import { defineConfig, devices } from "@playwright/test";

/**
 * Full-stack e2e config. Tests run against a real browser + the real dev server + the real Supabase
 * dev database, with a throwaway user created/deleted around the run (e2e/glboal-setup.ts and global-teardown.ts).
 * Because the database is shared, tests run serially (workers: 1) to avoid one test's data interfering with another's
 */

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],

  // Create the confirmed test user before, delete it (and its cascaded data) after
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry", // a full trace is saved only when a test is retried — great for debugging
  },

  projects: [
    // 1) Log in once through the UI and save the session.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    // 2) All specs reuse that session (guest specs opt out with an empty storageState)
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /.*\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
    },
  ],

  // Boot the app for the tests. Reuses an already-running `pnpm dev` if you have one open
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
