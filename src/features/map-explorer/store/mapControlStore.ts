import { createStore } from "zustand/vanilla";
import type { PanelView, PoiType } from "@/features/map-explorer/types/types";

/**
 * Programmatic control of the map: which panel is open, the display filters, highlighted places and
 * camera moves. It is the single place both the UI (clicks, toggles) and code outside the map tree
 * (the voice assistant's tools) go through to drive the map
 *
 * A vanilla store *factory* rather than a module-level singleton: MapControlProvider creates one per
 * mounted map, so the state resets when the map unmounts (like the local useState it replaces) and
 * never leaks between renders. Plain data + actions, so it is testable without React
 */

// Zoom used when flying to a single place - deep enough that every POI type and town pin is revealed
export const FOCUS_ZOOM = 11;

export type LatLngTuple = [lat: number, lng: number];

export type CameraTarget =
  | { kind: "point"; lat: number; lng: number; zoom: number }
  | { kind: "county"; countyId: string }
  | { kind: "points"; points: LatLngTuple[] };

/**
 * A camera move waiting to be applied by MapCameraController (the only code that touches Leaflet)
 * 'seq' increases on every request, so asking for the same target twice still moves the camera
 */
export interface CameraRequest {
  target: CameraTarget;
  seq: number;
}

// A place resolved to coordinates by the caller - the store holds no reference data on purpose
export interface PlaceTarget {
  id: string;
  countyId: string;
  lat: number;
  lng: number;
}

export interface MapControlState {
  view: PanelView | null;
  /**
   * Who last changed `view`: "user" (clicks, via setView) or "api" (showPoi/showCity/focusCounty)
   * Lets listeners react to the user's own navigation only - e.g. the voice assistant tells the agent
   * what the user opened, but not what the agent itself just showed
   */
  viewSource: "user" | "api";
  showPoiNames: boolean;
  hiddenTypes: ReadonlySet<PoiType>; // a type is shown unless it is in here
  showCustom: boolean; // "My places" - the user's custom POIs, independent of the type filters
  highlightedIds: ReadonlySet<string>; // POI or city ids drawn with a highlight ring
  camera: CameraRequest | null;
}

export interface MapControlActions {
  // UI-level setters, used by useMapNavigation / useMapFilters
  setView(next: PanelView | null | ((prev: PanelView | null) => PanelView | null)): void;
  toggleNames(): void;
  toggleType(type: PoiType): void;
  toggleCustom(): void;

  // Programmatic API - opens the matching panel and moves the camera
  showPoi(place: PlaceTarget): void;
  showCity(place: PlaceTarget): void;
  focusCounty(countyId: string): void;
  flyTo(lat: number, lng: number, zoom?: number): void;
  fitPoints(points: LatLngTuple[]): void;

  showOnlyTypes(visible: PoiType[], allTypes: PoiType[]): void; // category filter; others hidden
  showAllTypes(): void;
  highlightPlaces(ids: string[]): void;
  clearHighlights(): void;
}

export type MapControlStore = MapControlState & MapControlActions;

const initialState: MapControlState = {
  view: null,
  viewSource: "user",
  showPoiNames: true,
  hiddenTypes: new Set(),
  showCustom: true,
  highlightedIds: new Set(),
  camera: null,
};

export function createMapControlStore(
  overrides: Partial<MapControlState> = {},
) {
  return createStore<MapControlStore>()((set) => {
    // Each request gets a fresh seq, so the controller can tell a new request from an old one
    const requestCamera = (target: CameraTarget) =>
      set((state) => ({
        camera: { target, seq: (state.camera?.seq ?? 0) + 1 },
      }));

    return {
      ...initialState,
      ...overrides,

      setView: (next) =>
        set((state) => ({
          view: typeof next === "function" ? next(state.view) : next,
          viewSource: "user",
        })),

      toggleNames: () => set((state) => ({ showPoiNames: !state.showPoiNames })),

      toggleType: (type) =>
        set((state) => {
          const hiddenTypes = new Set(state.hiddenTypes);
          if (hiddenTypes.has(type)) hiddenTypes.delete(type);
          else hiddenTypes.add(type);
          return { hiddenTypes };
        }),

      toggleCustom: () => set((state) => ({ showCustom: !state.showCustom })),

      showPoi: ({ id, countyId, lat, lng }) => {
        set({ view: { kind: "poi", poiId: id, countyId }, viewSource: "api" });
        requestCamera({ kind: "point", lat, lng, zoom: FOCUS_ZOOM });
      },

      showCity: ({ id, countyId, lat, lng }) => {
        set({ view: { kind: "city", cityId: id, countyId }, viewSource: "api" });
        requestCamera({ kind: "point", lat, lng, zoom: FOCUS_ZOOM });
      },

      focusCounty: (countyId) => {
        set({ view: { kind: "county", countyId }, viewSource: "api" });
        requestCamera({ kind: "county", countyId });
      },

      flyTo: (lat, lng, zoom = FOCUS_ZOOM) =>
        requestCamera({ kind: "point", lat, lng, zoom }),

      fitPoints: (points) => {
        if (points.length) requestCamera({ kind: "points", points });
      },

      showOnlyTypes: (visible, allTypes) => {
        const keep = new Set(visible);
        set({ hiddenTypes: new Set(allTypes.filter((type) => !keep.has(type))) });
      },

      showAllTypes: () => set({ hiddenTypes: new Set() }),

      highlightPlaces: (ids) => set({ highlightedIds: new Set(ids) }),

      clearHighlights: () => set({ highlightedIds: new Set() }),
    };
  });
}

export type MapControlStoreApi = ReturnType<typeof createMapControlStore>;
