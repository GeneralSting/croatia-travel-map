"use client";

import { useEffect } from "react";
import { useConversationControls } from "@elevenlabs/react";

/**
 * Dev/e2e ONLY (excluded from production builds by the guard at its call site): exposes the SDK's
 * sendUserMessage on window, so a running voice session can be driven with typed text - from tests
 * (a fake microphone can only play a tone) or by hand in the browser console:
 *   __voice.sendUserMessage("Pokaži mi neki grad na istoku")
 * The agent treats it exactly like a spoken turn, tools included
 */
export default function VoiceTestBridge() {
  const { sendUserMessage } = useConversationControls();

  useEffect(() => {
    const bridge = window as unknown as { __voice?: unknown };
    bridge.__voice = { sendUserMessage };
    return () => {
      delete bridge.__voice;
    };
  }, [sendUserMessage]);

  return null;
}
