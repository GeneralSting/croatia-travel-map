// Pure read helpers ("selectors") over the static map data — deriving map pins, lookups, and
// the "percent explored" / fill-colour used across the feature. No side effects.

import {
  CITIES,
  MOUNTAINS,
  POIS,
  POI_CITY_ID,
} from "@/features/map-explorer/data/croatiaData";
import type { City, POI, POIDataMap } from "@/features/map-explorer/types";

/**
 * Seed POIs drawn on the map: those that have coordinates AND are not tied to a city. A POI
 * that belongs to a city (Diocletian's Palace, the Sea Organ…) shows only inside that city's
 * drawer — the map is for distinct destinations (campsites, parks, rivers, islands…).
 */
export function mappablePois(): POI[] {
  return POIS.filter(
    (p) =>
      typeof p.lat === "number" &&
      typeof p.lng === "number" &&
      !POI_CITY_ID[p.id],
  );
}

const poiById = Object.fromEntries(POIS.map((p) => [p.id, p]));

/** Look up a single seed POI by id. */
export function getPoi(poiId: string): POI | undefined {
  return poiById[poiId];
}

/** Mountain peaks expressed as POIs (they already carry real coordinates). */
export function mountainPois(): POI[] {
  return MOUNTAINS.map((m) => ({
    id: m.id,
    county_id: m.county_id,
    name: m.name,
    type: "mountain" as const,
    description: "",
    lat: m.lat,
    lng: m.lng,
  }));
}

const mountainById = Object.fromEntries(mountainPois().map((p) => [p.id, p]));

/** Look up a single mountain (as a POI) by id. */
export function getMountainPoi(poiId: string): POI | undefined {
  return mountainById[poiId];
}

export function getVisitedPercent(
  countyId: string,
  poiDataMap: POIDataMap,
): number {
  const countyPois = POIS.filter((p) => p.county_id === countyId);
  if (countyPois.length === 0) return 0;
  const visited = countyPois.filter(
    (p) => poiDataMap[p.id]?.status === "visited",
  ).length;
  return Math.round((visited / countyPois.length) * 100);
}

export function getGradientColor(percent: number): string {
  if (percent === 0) return "#334155";
  if (percent <= 25) {
    const t = percent / 25;
    return interpolateColor("#334155", "#1D4ED8", t);
  }
  if (percent <= 50) {
    const t = (percent - 25) / 25;
    return interpolateColor("#1D4ED8", "#D97706", t);
  }
  if (percent <= 75) {
    const t = (percent - 50) / 25;
    return interpolateColor("#D97706", "#16A34A", t);
  }
  const t = (percent - 75) / 25;
  return interpolateColor("#16A34A", "#15803D", t);
}

function interpolateColor(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const cityById = Object.fromEntries(CITIES.map((c) => [c.id, c]));

export function getCity(cityId: string): City | undefined {
  return cityById[cityId];
}

/** Cover image path for a city, falling back to the `/cities/<id>.jpg` convention. */
export function cityCover(city: City): string {
  return city.coverImage ?? `/cities/${city.id}.jpg`;
}

/** Cities inside a county, ordered by importance (major first). */
export function citiesForCounty(countyId: string): City[] {
  return CITIES.filter((c) => c.county_id === countyId).sort(
    (a, b) => a.importance - b.importance,
  );
}

/** The POIs that make up a city's "places to visit" list. */
export function poisForCity(cityId: string): POI[] {
  return POIS.filter((p) => POI_CITY_ID[p.id] === cityId);
}

/** County POIs that are NOT tied to a city (shown directly in the county panel). */
export function looseCountyPois(countyId: string): POI[] {
  return POIS.filter((p) => p.county_id === countyId && !POI_CITY_ID[p.id]);
}

/** A city's own explored percentage, from the status of its places to visit. */
export function getCityPercent(cityId: string, poiDataMap: POIDataMap): number {
  const pois = poisForCity(cityId);
  if (pois.length === 0) return 0;
  const visited = pois.filter((p) => poiDataMap[p.id]?.status === "visited").length;
  return Math.round((visited / pois.length) * 100);
}
