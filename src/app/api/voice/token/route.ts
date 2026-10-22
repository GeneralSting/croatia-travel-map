import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TOKEN_RATE_LIMIT } from "@/features/voice-assistant/constants/config";
import {
  ConversationTokenError,
  fetchConversationToken,
  getVoiceServerConfig,
} from "@/features/voice-assistant/server/conversationToken";
import { createRateLimiter } from "@/features/voice-assistant/server/rateLimit";
import { isSameOrigin } from "@/features/voice-assistant/server/sameOrigin";
import type {
  VoiceTokenErrorCode,
  VoiceTokenResponse,
} from "@/features/voice-assistant/types/types";

/**
 * POST /api/voice/token - hands a signed-in user a short-lived ElevenLabs conversation token
 *
 * Each started session costs voice minutes, so the checks run cheapest-first and every failure stops
 * before we call ElevenLabs:
 *  1. feature on + configured  -> 503 voice_unavailable
 *  2. same-origin request      -> 403 forbidden
 *  3. signed-in user           -> 401 unauthorized
 *  4. per-user rate limit      -> 429 rate_limited (+ Retry-After)
 *  5. upstream token           -> 502 upstream_error
 *
 * POST, not GET: it creates something (a session token) rather than reading a resource, and route
 * handlers never cache non-GET methods
 */

// Module scope: one limiter per server process (see the limitation noted in rateLimit.ts)
const limiter = createRateLimiter(TOKEN_RATE_LIMIT);

const NO_STORE = { "Cache-Control": "no-store" };

function fail(error: VoiceTokenErrorCode, status: number, headers = {}) {
  return NextResponse.json<VoiceTokenResponse>(
    { error },
    { status, headers: { ...NO_STORE, ...headers } },
  );
}

export async function POST(request: Request) {
  const config = getVoiceServerConfig();
  if (!config) return fail("voice_unavailable", 503);

  if (!isSameOrigin(request)) return fail("forbidden", 403);

  // getUser() verifies the session with Supabase Auth - unlike getSession(), it can't be spoofed by a
  // tampered cookie, which matters on the server
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", 401);

  const { allowed, retryAfterSec } = limiter.check(user.id);
  if (!allowed) {
    return fail("rate_limited", 429, { "Retry-After": String(retryAfterSec) });
  }

  try {
    const token = await fetchConversationToken(config);
    return NextResponse.json<VoiceTokenResponse>(
      { token },
      { headers: NO_STORE },
    );
  } catch (error) {
    // Log the status only - never the API key, the token or the upstream body
    const status =
      error instanceof ConversationTokenError ? error.status : "network/timeout";
    console.error(`[voice] conversation token request failed: ${status}`);
    return fail("upstream_error", 502);
  }
}
