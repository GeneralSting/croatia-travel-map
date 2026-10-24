"use client";

import { useEffect, useRef } from "react";
import { VOICE_COPY } from "@/features/voice-assistant/constants/copy";
import type { TranscriptEntry } from "@/features/voice-assistant/types/types";

interface VoiceTranscriptProps {
  entries: TranscriptEntry[];
}

/**
 * Live transcript of the conversation - the user's words on the right, the guide's on the left
 * Deliberately not an aria-live region: screen-reader users already hear the guide speak, and reading
 * the same text again would talk over it
 */
export default function VoiceTranscript({ entries }: VoiceTranscriptProps) {
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the newest line in view as the conversation grows
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [entries.length]);

  if (!entries.length) {
    return (
      <p className="text-xs text-white/40 italic">{VOICE_COPY.transcriptEmpty}</p>
    );
  }

  return (
    <ol
      ref={listRef}
      aria-label={VOICE_COPY.transcriptLabel}
      className="flex flex-col gap-2 overflow-y-auto pr-1"
    >
      {entries.map(({ id, role, text }) => {
        const isUser = role === "user";
        return (
          <li
            key={id}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-snug ${
              isUser
                ? "self-end bg-blue-600/80 text-white"
                : "self-start bg-white/10 text-white/90"
            }`}
          >
            <span className="sr-only">
              {isUser ? VOICE_COPY.speakerUser : VOICE_COPY.speakerAgent}:{" "}
            </span>
            {text}
          </li>
        );
      })}
    </ol>
  );
}
