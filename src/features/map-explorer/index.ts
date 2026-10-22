// Public API of the map-explorer feature. The app layer needs the map entry point (a client island
// that loads Leaflet with ssr:false); other features (the voice assistant) drive the map and read its
// data through the hooks below - always from inside <MapApp>'s children, where the providers live.

export { default as MapApp } from "@/features/map-explorer/components/MapApp";

export { useMapData } from "@/features/map-explorer/hooks/useMapData";
export { useMapControlApi } from "@/features/map-explorer/hooks/useMapControl";
export { useTravelData } from "@/features/map-explorer/hooks/useTravelData";
export { computeCountyPercents } from "@/features/map-explorer/utils/selectors";

export type { MapData } from "@/features/map-explorer/components/MapDataProvider";
export type { MapControlStoreApi } from "@/features/map-explorer/store/mapControlStore";
export type {
  City,
  County,
  POI,
  POIDataMap,
  POIRecord,
  POIStatus,
  POIUpdate,
  PoiType,
} from "@/features/map-explorer/types/types";
