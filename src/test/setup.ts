/**
 * Global test setup, run before every test file (wired via "setupFiles" in vitest.config.mts)
 *
 * Two jobs:
 *  1. Run the MSW server for the whole suite - listen before, reset overrides between tests
 *  so one test's handles can't leak into the next, close after
 *  2. Unmount React trees between tests. With Vitest's globals disabled we register cleanup
 *  ourselves rather than relying on RTL's auto-cleanup
 */

import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
