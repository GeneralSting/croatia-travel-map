import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { deleteTestUser } from "./helpers/admin";

/**
 * Runs once after the whole E2E run: delete the throwaway user - which cascades away all of its data
 * - and drop the saved session file. This is the safety guarantee: whatever the tests created, it is gone,
 * and the database is back to exactly its pre-run state
 */
export default async function globalTeardown() {
  await deleteTestUser();
  rmSync(resolve(process.cwd(), "e2e/.auth"), { recursive: true, force: true });
}
