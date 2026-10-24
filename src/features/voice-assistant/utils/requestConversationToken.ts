import { API_PATHS } from "@/lib/data";
import type {
  VoiceErrorKind,
  VoiceTokenResponse,
} from "@/features/voice-assistant/types/types";

// Carries the route's error code, so the UI can show the matching message
export class VoiceTokenRequestError extends Error {
  constructor(readonly kind: VoiceErrorKind) {
    super(`Voice token request failed: ${kind}`);
    this.name = "VoiceTokenRequestError";
  }
}

// Client side of /api/voice/token - same-origin fetch, so the browser attaches the auth cookies
export async function requestConversationToken(): Promise<string> {
  let response: Response;
  try {
    response = await fetch(API_PATHS.VOICE_TOKEN, { method: "POST" });
  } catch {
    throw new VoiceTokenRequestError("network");
  }

  const body = (await response.json().catch(() => null)) as VoiceTokenResponse | null;
  if (response.ok && body && "token" in body) return body.token;
  throw new VoiceTokenRequestError(
    body && "error" in body ? body.error : "upstream_error",
  );
}
