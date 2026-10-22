"use client";

import type { Ref } from "react";
import Link from "next/link";
import { AlertCircle, ChevronDown, Info, Loader2, Mic, MicOff, PhoneOff } from "lucide-react";
import { AUTH_PATHS } from "@/lib/data";
import { VOICE_COPY, VOICE_ERROR_COPY } from "@/features/voice-assistant/constants/copy";
import VoiceTranscript from "@/features/voice-assistant/components/VoiceTranscript";
import type {
  TranscriptEntry,
  VoiceErrorKind,
  VoicePhase,
} from "@/features/voice-assistant/types/types";

interface VoicePanelProps {
  primaryActionRef?: Ref<HTMLButtonElement | HTMLAnchorElement>; // focused when the panel opens
  signedIn: boolean;
  phase: VoicePhase;
  error: VoiceErrorKind | null;
  sessionLimitReached: boolean;
  transcript: TranscriptEntry[];
  isMuted: boolean;
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onMinimize: () => void;
}

/**
 * The conversation panel - presentational only, all state comes from useVoiceSession
 * Mobile-first: a bottom sheet across the screen on phones, a floating card above the mic button from
 * `sm` up (bottom-left, so it never covers the right-hand place panel the assistant opens)
 */
export default function VoicePanel({
  primaryActionRef,
  signedIn,
  phase,
  error,
  sessionLimitReached,
  transcript,
  isMuted,
  onStart,
  onEnd,
  onToggleMute,
  onMinimize,
}: VoicePanelProps) {
  const active = phase === "connecting" || phase === "listening" || phase === "speaking";
  const busy = phase === "requesting_mic" || phase === "connecting";
  const showIntro = !active && !transcript.length;

  return (
    <section
      id="voice-panel"
      aria-labelledby="voice-panel-title"
      className="fixed z-1001 inset-x-0 bottom-0 flex max-h-[60vh] flex-col rounded-t-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-sm sm:inset-x-auto sm:left-4 sm:bottom-33 sm:w-80 sm:max-h-[min(30rem,calc(100vh-11rem))] sm:rounded-xl motion-safe:animate-voice-panel-in"
    >
      {/* Header: live status + minimise (the session keeps running while minimised) */}
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <StatusOrb phase={phase} />
        <div className="min-w-0 flex-1">
          <h2 id="voice-panel-title" className="text-sm font-semibold text-white">
            {VOICE_COPY.title}
          </h2>
          <p role="status" className="truncate text-[11px] text-white/50">
            {VOICE_COPY.status[phase]}
          </p>
        </div>
        <button
          type="button"
          onClick={onMinimize}
          aria-label={VOICE_COPY.minimize}
          className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-400"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {!signedIn ? (
          <p className="text-sm text-white/70">{VOICE_COPY.signInRequired}</p>
        ) : (
          <>
            {showIntro && (
              <div className="space-y-2">
                <p className="text-sm text-white/80">{VOICE_COPY.intro}</p>
                <p className="text-xs text-white/45">{VOICE_COPY.micExplainer}</p>
              </div>
            )}
            {(active || transcript.length > 0) && <VoiceTranscript entries={transcript} />}
            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200"
              >
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                {VOICE_ERROR_COPY[error]}
              </p>
            )}
            {sessionLimitReached && !error && (
              <p className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                {VOICE_COPY.sessionLimit}
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom padding clears the iPhone home indicator when the sheet sits at the screen edge */}
      <footer className="flex items-center gap-2 border-t border-white/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
        {!signedIn ? (
          <Link
            ref={primaryActionRef as Ref<HTMLAnchorElement>}
            href={AUTH_PATHS.LOGIN}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            {VOICE_COPY.signIn}
          </Link>
        ) : active ? (
          <>
            <button
              type="button"
              onClick={onToggleMute}
              aria-pressed={isMuted}
              aria-label={isMuted ? VOICE_COPY.unmute : VOICE_COPY.mute}
              disabled={phase === "connecting"}
              className="rounded-lg border border-white/10 p-2 text-white/70 transition-colors hover:border-white/25 hover:text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              ref={primaryActionRef as Ref<HTMLButtonElement>}
              type="button"
              onClick={onEnd}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600/90 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              <PhoneOff className="h-4 w-4" />
              {VOICE_COPY.end}
            </button>
          </>
        ) : (
          <button
            ref={primaryActionRef as Ref<HTMLButtonElement>}
            type="button"
            onClick={onStart}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {error ? VOICE_COPY.retry : VOICE_COPY.start}
          </button>
        )}
      </footer>
    </section>
  );
}

// Small visual cue of who's talking: pulses while listening, bars move while the guide speaks
function StatusOrb({ phase }: { phase: VoicePhase }) {
  const tone =
    phase === "speaking"
      ? "bg-sky-500"
      : phase === "listening"
        ? "bg-blue-600"
        : phase === "error"
          ? "bg-red-600/80"
          : "bg-white/10";

  return (
    <span
      aria-hidden
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`}
    >
      {phase === "listening" && (
        <span className="absolute inset-0 rounded-full bg-blue-500/50 motion-safe:animate-ping" />
      )}
      {phase === "speaking" ? (
        <span className="relative flex h-4 items-end gap-0.5">
          {[0, 1, 2].map((bar) => (
            <span
              key={bar}
              className="w-1 origin-bottom rounded-full bg-white motion-safe:animate-voice-bar"
              style={{ height: "100%", animationDelay: `${bar * 0.15}s` }}
            />
          ))}
        </span>
      ) : phase === "connecting" || phase === "requesting_mic" ? (
        <Loader2 className="relative h-4 w-4 text-white motion-safe:animate-spin" />
      ) : (
        <Mic className="relative h-4 w-4 text-white" />
      )}
    </span>
  );
}
