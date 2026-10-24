import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit";

// Time is passed in explicitly, so the window logic is tested without fake timers

describe("createRateLimiter", () => {
  it("allows up to the limit within a window, then blocks with a retry hint", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });

    expect(limiter.check("user-1", 0).allowed).toBe(true);
    expect(limiter.check("user-1", 1_000).allowed).toBe(true);
    expect(limiter.check("user-1", 2_000)).toEqual({
      allowed: false,
      retryAfterSec: 58, // window opened at 0, resets at 60s
    });
  });

  it("opens a fresh window once the old one expires", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    limiter.check("user-1", 0);
    expect(limiter.check("user-1", 59_999).allowed).toBe(false);
    expect(limiter.check("user-1", 60_000).allowed).toBe(true);
  });

  it("counts each key separately", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    limiter.check("user-1", 0);
    expect(limiter.check("user-2", 0).allowed).toBe(true);
  });
});
