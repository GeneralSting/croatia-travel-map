import { afterEach, describe, expect, it, vi } from "vitest";
import { requestMicrophoneAccess } from "./microphone";

// jsdom has no media devices, so each test installs the navigator.mediaDevices it needs

function installMediaDevices(value: unknown) {
  Object.defineProperty(navigator, "mediaDevices", { value, configurable: true });
}

afterEach(() => installMediaDevices(undefined));

describe("requestMicrophoneAccess", () => {
  it("is 'unavailable' where the browser has no audio capture (e.g. an insecure page)", async () => {
    installMediaDevices(undefined);
    expect(await requestMicrophoneAccess()).toBe("unavailable");
  });

  it("is 'granted' and releases the test stream right away", async () => {
    const stop = vi.fn();
    installMediaDevices({
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }),
    });

    expect(await requestMicrophoneAccess()).toBe("granted");
    expect(stop).toHaveBeenCalled();
  });

  it("is 'denied' when the user or a policy refuses", async () => {
    installMediaDevices({
      getUserMedia: vi.fn().mockRejectedValue(new DOMException("no", "NotAllowedError")),
    });
    expect(await requestMicrophoneAccess()).toBe("denied");
  });

  it("is 'unavailable' when no microphone is found", async () => {
    installMediaDevices({
      getUserMedia: vi.fn().mockRejectedValue(new DOMException("none", "NotFoundError")),
    });
    expect(await requestMicrophoneAccess()).toBe("unavailable");
  });
});
