import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest setup per the Next.js guide
 * tsconfigPaths(): makes the "@/*" import alias work inside tests, same as the app
 * react(): compiles JSX/TSX so component + hook tests can render
 * json: a fake browser DOM, needed by RTL (renderHook/render)
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"], // Only pick up our test files; never the generated types or build output
    setupFiles: ["src/test/setup.ts"], // Runs before each test file: starts MSW and registers React cleanup.

    /**
     * fake Supabase env so the client builds and points at a host MSW can intercept.
     * These are not real credentials - integration tests never touch a real project.
     * E2E does; it reads the real values from .env.local instead
     */
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
});
