/**
 * Fixed-window, in-memory rate limiter: each key may make `limit` requests per `windowMs`
 *
 * Limitation (by design, for now): the counts live in this server process's memory. That works for
 * `next dev` and a single Node server, but on serverless hosting every instance has its own counts and
 * they reset on cold start - production should move this to a shared store (e.g. Redis) and also
 * enable the host's own rate limiting
 */

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number; // 0 when allowed; otherwise seconds until the window resets
}

interface Window {
  count: number;
  resetAt: number;
}

const SWEEP_THRESHOLD = 1_000; // above this many tracked keys, drop expired windows to bound memory

export function createRateLimiter({ limit, windowMs }: RateLimitOptions) {
  const windows = new Map<string, Window>();

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      if (windows.size > SWEEP_THRESHOLD) {
        for (const [trackedKey, window] of windows) {
          if (window.resetAt <= now) windows.delete(trackedKey);
        }
      }

      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSec: 0 };
      }

      if (current.count >= limit) {
        return {
          allowed: false,
          retryAfterSec: Math.ceil((current.resetAt - now) / 1000),
        };
      }

      current.count += 1;
      return { allowed: true, retryAfterSec: 0 };
    },
  };
}
