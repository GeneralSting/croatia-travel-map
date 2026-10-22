import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { MAX_SESSION_MS } from "@/features/voice-assistant/constants/config";
import { VOICE_COPY, VOICE_ERROR_COPY } from "@/features/voice-assistant/constants/copy";
import VoiceWidget from "./VoiceWidget";

// *** Integration tests ***

/**
 * The real widget, panel and session hook, with three boundaries replaced:
 *  - ElevenLabs SDK -> a fake whose status the test drives (a tiny external store, so a status change
 *    re-renders the components exactly like the real SDK hooks do)
 *  - microphone     -> navigator.mediaDevices.getUserMedia mocked (jsdom has no media devices)
 *  - token route    -> MSW; with no handler registered, any token request fails the test
 */

const sdk = vi.hoisted(() => {
  interface State {
    status: string;
    isSpeaking: boolean;
    isMuted: boolean;
  }
  const initial: State = { status: "disconnected", isSpeaking: false, isMuted: false };
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (patch: Partial<State>) => {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    },
    reset: () => {
      state = initial;
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    startSession: vi.fn(),
    endSession: vi.fn(),
    setMuted: vi.fn(),
  };
});

vi.mock("@elevenlabs/react", async () => {
  const { useSyncExternalStore } = await import("react");
  const useSdk = () => useSyncExternalStore(sdk.subscribe, sdk.get);
  return {
    useConversationControls: () => ({
      startSession: sdk.startSession,
      endSession: sdk.endSession,
    }),
    useConversationStatus: () => ({ status: useSdk().status }),
    useConversationMode: () => ({ isSpeaking: useSdk().isSpeaking }),
    useConversationInput: () => ({ isMuted: useSdk().isMuted, setMuted: sdk.setMuted }),
  };
});

const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/features/auth-portal", () => ({ useAuth: () => ({ user: auth.user }) }));

const getUserMedia = vi.fn();
const stopTrack = vi.fn();

// The options the widget passed to the SDK's startSession (token + per-session callbacks)
interface StartOptions {
  conversationToken: string;
  connectionType: string;
  onConnect: () => void;
  onMessage: (payload: { message: string; role: "user" | "agent" }) => void;
}
const startOptions = () => sdk.startSession.mock.calls[0][0] as StartOptions;

const openPanel = () =>
  fireEvent.click(screen.getByRole("button", { name: VOICE_COPY.openPanel }));
const startButton = () => screen.getByRole("button", { name: VOICE_COPY.start });

beforeEach(() => {
  /**
   * Reset mocks here, not in afterEach: Vitest runs after-hooks in reverse order, so the shared
   * cleanup (which unmounts the previous widget and thereby calls endSession) would run *after* an
   * afterEach reset and leak that call into the next test
   */
  vi.clearAllMocks();
  sdk.reset();
  auth.user = { id: "user-1" };
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("VoiceWidget", () => {
  it("asks a guest to sign in instead of offering a conversation", () => {
    auth.user = null;
    render(<VoiceWidget />);
    openPanel();

    expect(screen.getByText(VOICE_COPY.signInRequired)).toBeTruthy();
    expect(screen.getByRole("link", { name: VOICE_COPY.signIn })).toBeTruthy();
    expect(screen.queryByRole("button", { name: VOICE_COPY.start })).toBeNull();
  });

  it("starts a session: mic first, then a token, then the SDK - and shows the live transcript", async () => {
    server.use(
      http.post("*/api/voice/token", () => HttpResponse.json({ token: "tok_123" })),
    );
    render(<VoiceWidget />);
    openPanel();
    fireEvent.click(startButton());

    await waitFor(() => expect(sdk.startSession).toHaveBeenCalledTimes(1));
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(stopTrack).toHaveBeenCalled(); // the permission-check stream is released immediately
    expect(startOptions()).toMatchObject({
      conversationToken: "tok_123",
      connectionType: "webrtc",
    });

    // The SDK connects, and the guide says hello
    act(() => {
      startOptions().onConnect();
      sdk.set({ status: "connected" });
      startOptions().onMessage({ message: "Bok! Kamo želiš putovati?", role: "agent" });
    });
    expect(screen.getByRole("status").textContent).toBe(VOICE_COPY.status.listening);
    expect(screen.getByText("Bok! Kamo želiš putovati?")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: VOICE_COPY.end }));
    expect(sdk.endSession).toHaveBeenCalled();
  });

  it("explains a denied microphone and never requests a token", async () => {
    getUserMedia.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    render(<VoiceWidget />);
    openPanel();
    fireEvent.click(startButton());

    // No MSW handler is registered: a token request would fail this test as unhandled
    expect((await screen.findByRole("alert")).textContent).toBe(VOICE_ERROR_COPY.mic_denied);
    expect(sdk.startSession).not.toHaveBeenCalled();
  });

  it("shows the rate-limit message from the token route and offers a retry", async () => {
    server.use(
      http.post("*/api/voice/token", () =>
        HttpResponse.json({ error: "rate_limited" }, { status: 429 }),
      ),
    );
    render(<VoiceWidget />);
    openPanel();
    fireEvent.click(startButton());

    expect((await screen.findByRole("alert")).textContent).toBe(VOICE_ERROR_COPY.rate_limited);
    expect(screen.getByRole("button", { name: VOICE_COPY.retry })).toBeTruthy();
    expect(sdk.startSession).not.toHaveBeenCalled();
  });

  it("ends a live session after the maximum duration and says why", () => {
    vi.useFakeTimers();
    render(<VoiceWidget />);
    act(() => sdk.set({ status: "connected" }));

    act(() => vi.advanceTimersByTime(MAX_SESSION_MS));
    expect(sdk.endSession).toHaveBeenCalled();

    act(() => sdk.set({ status: "disconnected" }));
    openPanel();
    expect(screen.getByText(VOICE_COPY.sessionLimit)).toBeTruthy();
  });

  it("Escape minimises the panel without ending the session, and focus returns to the button", () => {
    render(<VoiceWidget />);
    act(() => sdk.set({ status: "connected" }));
    fireEvent.click(screen.getByRole("button", { name: VOICE_COPY.activeSession }));
    expect(document.activeElement?.textContent).toContain(VOICE_COPY.end); // focus on the main action

    fireEvent.keyDown(screen.getByRole("region", { name: VOICE_COPY.title }), {
      key: "Escape",
    });

    expect(screen.queryByRole("region", { name: VOICE_COPY.title })).toBeNull();
    expect(sdk.endSession).not.toHaveBeenCalled();
    expect(document.activeElement?.getAttribute("aria-label")).toBe(VOICE_COPY.activeSession);
  });

  it("ends the session when the widget unmounts (e.g. leaving the map)", () => {
    const { unmount } = render(<VoiceWidget />);
    unmount();
    expect(sdk.endSession).toHaveBeenCalled();
  });
});
