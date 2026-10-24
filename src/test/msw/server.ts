/**
 * The Mock Service Worker server for Node (Vitest).
 * "setupSetver" paches global fetch so any request our code makes is matched against the handlers.
 * Started/stopped once per test run in src/test/setup.ts
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
