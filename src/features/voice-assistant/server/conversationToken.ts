import "server-only";
import { z } from "zod";

/**
 * Server-side half of a voice session: exchange our secret API key for a short-lived WebRTC
 * conversation token. The browser then starts the session with that token, so the API key never
 * leaves the server. `server-only` makes any import of this module from client code a build error
 *
 * Endpoint: GET /v1/convai/conversation/token?agent_id=... with the `xi-api-key` header
 * https://elevenlabs.io/docs/api-reference/conversations/get-webrtc-token
 */

const TOKEN_URL = "https://api.elevenlabs.io/v1/convai/conversation/token";
const TIMEOUT_MS = 10_000; // don't let a slow upstream hold the request open

// Validate the upstream response instead of trusting its shape
const tokenResponseSchema = z.object({ token: z.string().min(1) });

export interface VoiceServerConfig {
  apiKey: string;
  agentId: string;
}

/**
 * The voice feature's server config, or null when it's turned off or not configured - the route then
 * answers "unavailable" instead of failing. Read per request rather than at module load, so env
 * changes (and test stubs) take effect
 */
export function getVoiceServerConfig(): VoiceServerConfig | null {
  const enabled = process.env.NEXT_PUBLIC_VOICE_ENABLED === "true";
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!enabled || !apiKey || !agentId) return null;
  return { apiKey, agentId };
}

// Carries only the upstream HTTP status - never the response body, which could echo request details
export class ConversationTokenError extends Error {
  constructor(readonly status: number) {
    super(`ElevenLabs token request failed with status ${status}`);
    this.name = "ConversationTokenError";
  }
}

export async function fetchConversationToken({
  apiKey,
  agentId,
}: VoiceServerConfig): Promise<string> {
  const url = new URL(TOKEN_URL);
  url.searchParams.set("agent_id", agentId);

  const response = await fetch(url, {
    headers: { "xi-api-key": apiKey },
    cache: "no-store", // every token is single-use - never serve one from a cache
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new ConversationTokenError(response.status);

  const parsed = tokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new ConversationTokenError(response.status);
  return parsed.data.token;
}
