"use client";

import dynamic from "next/dynamic";
import { VOICE_ENABLED } from "@/features/voice-assistant/constants/config";

/**
 * Entry point of the voice assistant, rendered over the loaded map (see app/page.tsx)
 *  - Flag off: renders nothing, and the SDK chunk is never downloaded
 *  - ssr: false: WebRTC, audio and the microphone exist only in the browser, so the SDK must never
 *    run during server rendering
 * next/dynamic: https://nextjs.org/docs/app/guides/lazy-loading
 */
const VoiceAssistantRoot = dynamic(
  () => import("@/features/voice-assistant/components/VoiceAssistantRoot"),
  { ssr: false },
);

export function VoiceAssistant() {
  if (!VOICE_ENABLED) return null;
  return <VoiceAssistantRoot />;
}
