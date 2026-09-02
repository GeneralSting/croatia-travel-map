/**
 * Default MSW request handlers, shared across integration tests
 *
 * Mock Service Worker intercepts the real HTTP calls the app makes - here, the requests the Supabase
 * client sends to `${NEXT_PUBLIC_SUPABASE_URL}/...`. Instead of stubbing our own code, we let the
 * real query/mutation code run and answer the network at the edge, which is as close to production
 * behaviour as a fastm offline test can get.
 *
 * Keep this list to responses every test can share. Test that needs a specific response for one case
 * overrides it with "server.use(...)" - those overrides are cleared after each test
 */

import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
