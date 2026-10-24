"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAuth } from "@/features/auth-portal";
import { useVoiceSession } from "@/features/voice-assistant/hooks/useVoiceSession";
import { useStarterPrompts } from "@/features/voice-assistant/hooks/useStarterPrompts";
import { useReserveMapArea } from "@/features/voice-assistant/hooks/useReserveMapArea";
import VoiceButton from "@/features/voice-assistant/components/VoiceButton";
import VoicePanel from "@/features/voice-assistant/components/VoicePanel";

/**
 * Mic button + conversation panel. Owns only UI state (open / minimised) and focus handling; the
 * conversation itself lives in useVoiceSession, so minimising never ends a running session
 *
 * Keyboard: the button toggles the panel, Escape inside the panel minimises it, and focus moves to the
 * panel's main action on open and back to the button on close
 */
export default function VoiceWidget() {
  const { user } = useAuth();
  const session = useVoiceSession();
  const starterPrompts = useStarterPrompts();
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const returnFocus = useRef(false); // only move focus back when the user closed the panel themselves

  useReserveMapArea(panelRef, open);

  useEffect(() => {
    if (open) primaryActionRef.current?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      buttonRef.current?.focus();
    }
  }, [open]);

  const minimize = useCallback(() => {
    returnFocus.current = true;
    setOpen(false);
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") minimize();
  };

  return (
    <>
      <VoiceButton
        ref={buttonRef}
        open={open}
        active={session.isActive}
        onClick={() => (open ? minimize() : setOpen(true))}
      />
      {open && (
        <div onKeyDown={handleKeyDown}>
          <VoicePanel
            panelRef={panelRef}
            primaryActionRef={primaryActionRef}
            signedIn={!!user}
            phase={session.phase}
            error={session.error}
            sessionLimitReached={session.sessionLimitReached}
            transcript={session.transcript}
            starterPrompts={starterPrompts}
            isMuted={session.isMuted}
            onStart={session.start}
            onPrompt={session.ask}
            onEnd={session.end}
            onToggleMute={session.toggleMute}
            onMinimize={minimize}
          />
        </div>
      )}
    </>
  );
}
