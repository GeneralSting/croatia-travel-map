import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Playwright's Node process does not auto-load .env.local (only the Next dev server does), so the
 * setup/teardown code loads it here before reading Supabase credentials
 */
export function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. E2E tests need it in .env.local — see .env.example and the Testing guide.`,
    );
  }
  return value;
}
