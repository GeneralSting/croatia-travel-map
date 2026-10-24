"use client";

import type { Ref } from "react";
import { Mic } from "lucide-react";
import { VOICE_COPY } from "@/features/voice-assistant/constants/copy";

interface VoiceButtonProps {
  ref?: Ref<HTMLButtonElement>; // React 19: ref is a regular prop, no forwardRef needed
  open: boolean;
  active: boolean; // a session is connecting or live - shown even while the panel is minimised
  onClick: () => void;
}

/**
 * Floating mic button, bottom-left above the journey summary bar (the right side belongs to the
 * toolbar and the place panel). On phones it hides while the panel is open, because the bottom
 * sheet covers it and has its own minimise button
 */
export default function VoiceButton({ ref, open, active, onClick }: VoiceButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={active ? VOICE_COPY.activeSession : VOICE_COPY.openPanel}
      aria-expanded={open}
      aria-controls="voice-panel"
      className={`${open ? "hidden sm:flex" : "flex"} fixed left-4 bottom-18 z-1001 h-12 w-12 items-center justify-center rounded-full border shadow-2xl backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
        active
          ? "bg-blue-600 border-blue-400 text-white"
          : "bg-slate-900/90 border-white/10 text-white/80 hover:text-white hover:border-white/25"
      }`}
    >
      {/* Live session: a soft ring pulses around the button (static under reduced motion) */}
      {active && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-blue-400/60 motion-safe:animate-ping"
        />
      )}
      <Mic className="relative h-5 w-5" />
    </button>
  );
}
