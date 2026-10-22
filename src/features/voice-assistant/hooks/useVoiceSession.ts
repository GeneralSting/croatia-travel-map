"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useConversationControls,
  useConversationInput,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";
import { MAX_SESSION_MS } from "@/features/voice-assistant/constants/config";
import { requestMicrophoneAccess } from "@/features/voice-assistant/utils/microphone";
import { cleanAgentText } from "@/features/voice-assistant/utils/transcript";
import {
  requestConversationToken,
  VoiceTokenRequestError,
} from "@/features/voice-assistant/utils/requestConversationToken";
import type {
  TranscriptEntry,
  VoiceErrorKind,
  VoicePhase,
} from "@/features/voice-assistant/types/types";

/**
 * One voice conversation, start to finish. Must be used inside the SDK's <ConversationProvider>
 *
 * Start sequence (each step can fail with its own message):
 *  1. microphone permission    -> mic_denied / mic_unavailable (no token spent)
 *  2. token from our server    -> unauthorized / rate_limited / ... (see the token route)
 *  3. SDK opens the WebRTC session -> "connection" if it fails or drops
 *
 * The SDK's granular hooks are used instead of useConversation(): controls never re-render, and status
 * and mode only re-render when they change
 * https://elevenlabs.io/docs/agents-platform/libraries/react
 */
export function useVoiceSession() {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const { isSpeaking } = useConversationMode();
  const { isMuted, setMuted } = useConversationInput();

  // Our own steps before the SDK takes over: asking for the mic, then fetching the token + connecting
  const [preparing, setPreparing] = useState<"mic" | "session" | null>(null);
  const [error, setError] = useState<VoiceErrorKind | null>(null);
  const [sessionLimitReached, setSessionLimitReached] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const nextEntryId = useRef(0);

  const start = useCallback(async () => {
    if (preparing || status === "connecting" || status === "connected") return;
    setError(null);
    setSessionLimitReached(false);
    setTranscript([]);

    setPreparing("mic");
    const microphone = await requestMicrophoneAccess();
    if (microphone !== "granted") {
      setPreparing(null);
      setError(microphone === "denied" ? "mic_denied" : "mic_unavailable");
      return;
    }

    setPreparing("session");
    try {
      const conversationToken = await requestConversationToken();
      /**
       * Callbacks passed here apply to this session only. They clear `preparing` once the SDK reports
       * back, so the phase then follows the SDK's own status
       */
      startSession({
        conversationToken,
        connectionType: "webrtc",
        onConnect: () => setPreparing(null),
        onMessage: ({ message, role }) => {
          const text = role === "agent" ? cleanAgentText(message) : message;
          if (!text) return;
          const id = nextEntryId.current++;
          setTranscript((entries) => [...entries, { id, role, text }]);
        },
        onError: () => {
          setPreparing(null);
          setError("connection");
        },
        onDisconnect: (details) => {
          setPreparing(null);
          if (details.reason === "error") setError("connection");
        },
      });
    } catch (requestError) {
      setPreparing(null);
      setError(
        requestError instanceof VoiceTokenRequestError
          ? requestError.kind
          : "network",
      );
    }
  }, [preparing, status, startSession]);

  const end = useCallback(() => {
    setPreparing(null);
    endSession();
  }, [endSession]);

  // Hard cap on the session length - voice minutes are billed, and a forgotten open mic shouldn't run on
  useEffect(() => {
    if (status !== "connected") return;
    const timer = setTimeout(() => {
      setSessionLimitReached(true);
      endSession();
    }, MAX_SESSION_MS);
    return () => clearTimeout(timer);
  }, [status, endSession]);

  // Leaving the page (or unmounting the map) must never leave a live microphone session behind
  useEffect(() => () => endSession(), [endSession]);

  const phase: VoicePhase =
    error || status === "error"
      ? "error"
      : status === "connected"
        ? isSpeaking
          ? "speaking"
          : "listening"
        : preparing === "mic"
          ? "requesting_mic"
          : preparing === "session" || status === "connecting"
            ? "connecting"
            : "idle";

  return {
    phase,
    error: error ?? (status === "error" ? "connection" : null),
    isActive: phase === "connecting" || phase === "listening" || phase === "speaking",
    sessionLimitReached,
    transcript,
    isMuted,
    toggleMute: () => setMuted(!isMuted),
    start,
    end,
  };
}
