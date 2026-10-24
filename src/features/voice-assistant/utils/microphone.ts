export type MicrophoneAccess = "granted" | "denied" | "unavailable";

/**
 * Ask for the microphone *before* starting a session, so a refusal is caught here with a clear
 * message instead of surfacing as a generic connection error - and before we spend a rate-limited
 * conversation token. The stream is stopped right away: the SDK opens its own when the session starts
 *
 * getUserMedia: https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia
 */
export async function requestMicrophoneAccess(): Promise<MicrophoneAccess> {
  // Missing entirely on insecure (non-HTTPS, non-localhost) pages and in some embedded browsers
  if (!navigator.mediaDevices?.getUserMedia) return "unavailable";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return "granted";
  } catch (error) {
    // NotAllowedError = user or policy refused; NotFoundError / NotReadableError = no usable device
    const name = error instanceof DOMException ? error.name : "";
    return name === "NotAllowedError" || name === "SecurityError"
      ? "denied"
      : "unavailable";
  }
}
