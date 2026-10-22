/**
 * Voice-assistant settings shared by the client and the token route
 *
 * The feature flag is read with a *literal* `process.env.NEXT_PUBLIC_VOICE_ENABLED`: Next.js inlines
 * NEXT_PUBLIC_ values into the client bundle at build time, and it only does so for literal access -
 * a dynamic lookup (process.env[key], e.g. via getEnvVariable) would be undefined in the browser
 */
export const VOICE_ENABLED = process.env.NEXT_PUBLIC_VOICE_ENABLED === "true";

// Hard cap on one conversation, enforced by the client - voice minutes are billed per second
export const MAX_SESSION_MS = 5 * 60_000;

// Token route: at most this many new sessions per user per window
export const TOKEN_RATE_LIMIT = { limit: 5, windowMs: 10 * 60_000 } as const;
