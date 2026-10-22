"use client";

import { ConversationProvider } from "@elevenlabs/react";
import VoiceWidget from "@/features/voice-assistant/components/VoiceWidget";

/**
 * The SDK's provider wraps the whole voice UI: it owns the connection, and every conversation hook
 * (controls, status, mode, input - and later the client tools) must sit beneath it
 * Loaded lazily by VoiceAssistant, so the SDK is a separate chunk that only downloads when the
 * feature is on
 */
export default function VoiceAssistantRoot() {
  return (
    <ConversationProvider>
      <VoiceWidget />
    </ConversationProvider>
  );
}
