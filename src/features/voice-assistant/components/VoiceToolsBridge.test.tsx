import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { createMapControlStore } from "@/features/map-explorer/store/mapControlStore";
import { makeCity } from "@/features/map-explorer/test/fixtures";
import { VOICE_TOOL_NAMES } from "@/features/voice-assistant/tools/createVoiceTools";
import VoiceToolsBridge from "./VoiceToolsBridge";

// *** Integration tests ***

/**
 * The bridge with a real map-control store; the SDK and the map's data hooks are faked. Checks the
 * two jobs: every tool is registered under its dashboard name, and the agent hears about the user's
 * own map clicks - but not about what its own tools just showed
 */

const sdk = vi.hoisted(() => ({
  tools: new Map<string, (params: Record<string, unknown>) => unknown>(),
  status: "connected",
  sendContextualUpdate: vi.fn(),
}));

vi.mock("@elevenlabs/react", () => ({
  useConversationClientTool: (name: string, handler: (params: Record<string, unknown>) => unknown) =>
    sdk.tools.set(name, handler),
  useConversationControls: () => ({ sendContextualUpdate: sdk.sendContextualUpdate }),
  useConversationStatus: () => ({ status: sdk.status }),
}));

const map = vi.hoisted(() => ({ store: null as unknown }));
const SPLIT = makeCity({ id: "split", name: "Split", county_id: "split-dalmatia", lat: 43.5, lng: 16.44 });

vi.mock("@/features/map-explorer", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/map-explorer")>()),
  useMapControlApi: () => map.store,
  useMapData: () => ({
    counties: [{ id: "split-dalmatia", name: "Split-Dalmatia" }],
    cities: [SPLIT],
    pois: [],
    getCounty: () => ({ id: "split-dalmatia", name: "Split-Dalmatia" }),
    getCity: (id: string) => (id === "split" ? SPLIT : undefined),
    getPoi: () => undefined,
    getVisitedPercent: () => 0,
  }),
  useTravelData: () => ({ poiDataMap: {}, countyDataMap: {}, updatePOI: vi.fn() }),
}));

vi.mock("@/features/auth-portal", () => ({ useAuth: () => ({ user: { id: "user-1" } }) }));

let store: ReturnType<typeof createMapControlStore>;

beforeEach(() => {
  vi.clearAllMocks();
  sdk.tools.clear();
  sdk.status = "connected";
  store = createMapControlStore();
  map.store = store;
});

describe("VoiceToolsBridge", () => {
  it("registers every tool under the exact name the agent is configured with", () => {
    render(<VoiceToolsBridge />);
    expect([...sdk.tools.keys()].sort()).toEqual([...VOICE_TOOL_NAMES].sort());
  });

  it("a registered tool drives the real map store", () => {
    render(<VoiceToolsBridge />);
    act(() => {
      sdk.tools.get("show_place")!({ placeId: "split" });
    });
    expect(store.getState().view).toMatchObject({ kind: "city", cityId: "split" });
  });

  it("tells the agent when the user opens something on the map", () => {
    render(<VoiceToolsBridge />);
    act(() => store.getState().setView({ kind: "city", cityId: "split", countyId: "split-dalmatia" }));

    expect(sdk.sendContextualUpdate).toHaveBeenCalledTimes(1);
    expect(sdk.sendContextualUpdate.mock.calls[0][0]).toContain("The user opened the city Split");
  });

  it("doesn't echo back what the agent's own tool just showed", () => {
    render(<VoiceToolsBridge />);
    act(() => {
      sdk.tools.get("show_place")!({ placeId: "split" });
    });
    expect(sdk.sendContextualUpdate).not.toHaveBeenCalled();
  });

  it("stays quiet when no conversation is running", () => {
    sdk.status = "disconnected";
    render(<VoiceToolsBridge />);
    act(() => store.getState().setView({ kind: "city", cityId: "split", countyId: "split-dalmatia" }));
    expect(sdk.sendContextualUpdate).not.toHaveBeenCalled();
  });
});
