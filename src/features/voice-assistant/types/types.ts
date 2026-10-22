// The token route's response contract - shared so the client can map each error to a message

export type VoiceTokenErrorCode =
  | "voice_unavailable" // feature off, or ElevenLabs env vars missing
  | "forbidden" // request didn't come from our own origin
  | "unauthorized" // not signed in
  | "rate_limited" // too many sessions started recently
  | "upstream_error"; // ElevenLabs didn't return a token

export interface VoiceTokenSuccess {
  token: string; // WebRTC conversation token for startSession({ conversationToken })
}

export interface VoiceTokenFailure {
  error: VoiceTokenErrorCode;
}

export type VoiceTokenResponse = VoiceTokenSuccess | VoiceTokenFailure;
