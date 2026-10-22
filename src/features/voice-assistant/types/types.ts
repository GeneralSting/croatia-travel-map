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

// Everything that can go wrong from the user's point of view - each maps to one Croatian message
export type VoiceErrorKind =
  | VoiceTokenErrorCode
  | "network" // our own server couldn't be reached
  | "mic_denied" // the user (or a browser policy) blocked the microphone
  | "mic_unavailable" // no microphone, or no audio capture in this browser/context
  | "connection"; // the voice connection failed or dropped mid-conversation

// What the panel shows, derived from our own steps + the SDK's connection status
export type VoicePhase =
  | "idle"
  | "requesting_mic"
  | "connecting"
  | "listening"
  | "speaking"
  | "error";

export interface TranscriptEntry {
  id: number;
  role: "user" | "agent";
  text: string;
}
