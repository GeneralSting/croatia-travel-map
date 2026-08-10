export const SCREEN_BG =
  "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)";

// Presentation for POI types — kept in the frontend on purpose. The canonical type values and
// labels live in the DB (poi_types); the icon + marker color are pure view concerns, so they stay
// here and get merged with the DB rows in MapDataProvider.

import type {
  CityImportance,
  PoiType,
} from "@/features/map-explorer/types/types";

export const POI_TYPE_STYLE: Record<PoiType, { icon: string; color: string }> =
  {
    city: { icon: "🏙️", color: "#6366F1" },
    mountain: { icon: "⛰️", color: "#78716C" },
    lake: { icon: "💧", color: "#0EA5E9" },
    river: { icon: "🌊", color: "#06B6D4" },
    national_park: { icon: "🌲", color: "#16A34A" },
    nature: { icon: "🍃", color: "#22C55E" },
    island: { icon: "🏝️", color: "#F59E0B" },
    campsite: { icon: "⛺", color: "#EA580C" },
    landmark: { icon: "🏛️", color: "#8B5CF6" },
  };

// Lowest map zoom level at which a city of each importance tier becomes visible
export const CITY_MIN_ZOOM: Record<CityImportance, number> = {
  1: 7,
  2: 8,
  3: 10,
};
