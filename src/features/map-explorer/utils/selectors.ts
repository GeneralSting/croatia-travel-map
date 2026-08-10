// Pure, data-independent helpers over map data. The lookups that need the fetched reference data
// (getPoi, getCity, mappablePois, …) now live in MapDataProvider; what remains here is pure math
// and formatting that takes its inputs as arguments.

import type {
  City,
  POI,
  POIDataMap,
} from "@/features/map-explorer/types/types";

// ── Views over the fetched POIs/cities (pure — take the data, return a slice) ───────────────────

function hasCoords(poi: POI): poi is POI & { lat: number; lng: number } {
  return typeof poi.lat === "number" && typeof poi.lng === "number";
}

/** POIs drawn as pins: have coordinates and aren't attached to a city (defaults + custom). */
export function mappablePois(pois: POI[]): POI[] {
  return pois.filter((poi) => hasCoords(poi) && poi.city_id == null);
}

/** A city's "places to visit" list. */
export function poisForCity(pois: POI[], cityId: string): POI[] {
  return pois.filter((poi) => poi.city_id === cityId);
}

/** Default (non-custom) county POIs not tied to a city — the county panel's own list. */
export function looseCountyPois(defaultPois: POI[], countyId: string): POI[] {
  return defaultPois.filter(
    (poi) => poi.county_id === countyId && poi.city_id == null,
  );
}

/** The user's own custom POIs within a county (the county panel's "My Places"). */
export function customPoisForCounty(pois: POI[], countyId: string): POI[] {
  return pois.filter(
    (poi) => poi.owner_id != null && poi.county_id === countyId,
  );
}

/** All default POIs in a county — the basis for the county's explored %. */
export function countyDefaultPois(defaultPois: POI[], countyId: string): POI[] {
  return defaultPois.filter((poi) => poi.county_id === countyId);
}

/** Cities inside a county, major first. */
export function citiesForCounty(cities: City[], countyId: string): City[] {
  return cities
    .filter((city) => city.county_id === countyId)
    .sort((a, b) => a.importance - b.importance);
}

/** Explored percentage for a set of POIs, from how many are marked "visited". */
export function percentVisited(pois: POI[], poiDataMap: POIDataMap): number {
  if (pois.length === 0) return 0;
  const visited = pois.filter(
    (poi) => poiDataMap[poi.id]?.status === "visited",
  ).length;
  return Math.round((visited / pois.length) * 100);
}

/** Cover image path for a city, falling back to the `/cities/<id>.jpg` convention. */
export function cityCover(city: City): string {
  return city.coverImage ?? `/cities/${city.id}.jpg`;
}

export function getGradientColor(percent: number): string {
  if (percent === 0) return "#334155";
  if (percent <= 25) {
    const ratio = percent / 25;
    return interpolateColor("#334155", "#1D4ED8", ratio);
  }
  if (percent <= 50) {
    const ratio = (percent - 25) / 25;
    return interpolateColor("#1D4ED8", "#D97706", ratio);
  }
  if (percent <= 75) {
    const ratio = (percent - 50) / 25;
    return interpolateColor("#D97706", "#16A34A", ratio);
  }
  const ratio = (percent - 75) / 25;
  return interpolateColor("#16A34A", "#15803D", ratio);
}

function interpolateColor(
  fromHex: string,
  toHex: string,
  ratio: number,
): string {
  const fromRed = parseInt(fromHex.slice(1, 3), 16);
  const fromGreen = parseInt(fromHex.slice(3, 5), 16);
  const fromBlue = parseInt(fromHex.slice(5, 7), 16);
  const toRed = parseInt(toHex.slice(1, 3), 16);
  const toGreen = parseInt(toHex.slice(3, 5), 16);
  const toBlue = parseInt(toHex.slice(5, 7), 16);
  const red = Math.round(fromRed + (toRed - fromRed) * ratio);
  const green = Math.round(fromGreen + (toGreen - fromGreen) * ratio);
  const blue = Math.round(fromBlue + (toBlue - fromBlue) * ratio);
  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
}
