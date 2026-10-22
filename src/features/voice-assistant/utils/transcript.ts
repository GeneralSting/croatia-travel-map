/**
 * The agent's text can carry expressive audio tags such as "[happy]" or "[laughs]" - instructions for
 * how the voice should sound, not words. They're spoken as tone, so the transcript drops them
 * (letters, spaces and hyphens in square brackets, short enough not to be real bracketed content)
 */
const AUDIO_TAG = /\[[\p{L} -]{1,30}\]\s*/gu;

export function cleanAgentText(text: string): string {
  return text.replace(AUDIO_TAG, "").replace(/\s{2,}/g, " ").trim();
}
