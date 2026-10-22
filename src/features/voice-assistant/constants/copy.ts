import type { VoiceErrorKind } from "@/features/voice-assistant/types/types";

/**
 * Croatian UI copy for the voice assistant, kept in one place: the rest of the app is English and
 * has no i18n setup yet, so this is the single file a future translation layer would replace
 * Wording avoids gendered verb forms (e.g. "Prijavi se" instead of "Jesi li se prijavio?"), so it
 * reads naturally for every user
 */
export const VOICE_COPY = {
  title: "Glasovni vodič",
  openPanel: "Otvori glasovnog vodiča",
  activeSession: "Glasovni vodič je aktivan - otvori razgovor",
  minimize: "Smanji",

  intro: "Pitaj me o mjestima po Hrvatskoj - mogu ti ih i pokazati na karti.",
  micExplainer:
    "Za razgovor treba pristup mikrofonu. Preglednik će zatražiti dopuštenje, a zvuk se šalje samo dok razgovor traje.",
  start: "Započni razgovor",
  end: "Završi razgovor",
  retry: "Pokušaj ponovno",
  mute: "Isključi mikrofon",
  unmute: "Uključi mikrofon",

  signInRequired: "Za razgovor s vodičem potrebna je prijava.",
  signIn: "Prijavi se",

  status: {
    idle: "Spreman za razgovor",
    requesting_mic: "Čekam dopuštenje za mikrofon…",
    connecting: "Spajam se…",
    listening: "Slušam…",
    speaking: "Vodič govori…",
    error: "Razgovor nije uspio",
  },

  transcriptLabel: "Transkript razgovora",
  transcriptEmpty: "Reci nešto - na primjer: „Što vrijedi vidjeti u Istri?”",
  speakerUser: "Ti",
  speakerAgent: "Vodič",

  sessionLimit: "Razgovor je završen nakon 5 minuta. Možeš započeti novi.",
} as const;

export const VOICE_ERROR_COPY: Record<VoiceErrorKind, string> = {
  mic_denied:
    "Pristup mikrofonu je odbijen. Dopusti mikrofon u postavkama preglednika pa pokušaj ponovno.",
  mic_unavailable:
    "Mikrofon nije pronađen ili ga ovaj preglednik ne podržava.",
  unauthorized: "Prijava je istekla. Prijavi se ponovno pa pokušaj još jednom.",
  rate_limited:
    "Previše razgovora u kratkom vremenu. Pokušaj ponovno za nekoliko minuta.",
  voice_unavailable: "Glasovni vodič trenutno nije dostupan.",
  forbidden: "Glasovni vodič trenutno nije dostupan.",
  upstream_error: "Glasovni servis se ne javlja. Pokušaj ponovno.",
  network: "Nema veze s poslužiteljem. Provjeri internet pa pokušaj ponovno.",
  connection: "Veza s vodičem je prekinuta. Pokušaj ponovno.",
};
