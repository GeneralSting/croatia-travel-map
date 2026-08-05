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
    (poi) =>
      typeof poi.lat === "number" &&
      typeof poi.lng === "number" &&
      !POI_CITY_ID[poi.id],
  );
}

const poiById = Object.fromEntries(POIS.map((poi) => [poi.id, poi]));

/** Look up a single seed POI by id. */
export function getPoi(poiId: string): POI | undefined {
  return poiById[poiId];
}

/** Mountain peaks expressed as POIs (they already carry real coordinates). */
export function mountainPois(): POI[] {
  return MOUNTAINS.map((mountain) => ({
    id: mountain.id,
    county_id: mountain.county_id,
    name: mountain.name,
    type: "mountain" as const,
    description: "",
    lat: mountain.lat,
    lng: mountain.lng,
  }));
}

const mountainById = Object.fromEntries(
  mountainPois().map((poi) => [poi.id, poi]),
);

/** Look up a single mountain (as a POI) by id. */
export function getMountainPoi(poiId: string): POI | undefined {
  return mountainById[poiId];
}

export function getVisitedPercent(
  countyId: string,
  poiDataMap: POIDataMap,
): number {
  const countyPois = POIS.filter((poi) => poi.county_id === countyId);
  if (countyPois.length === 0) return 0;
  const visited = countyPois.filter(
    (poi) => poiDataMap[poi.id]?.status === "visited",
  ).length;
  return Math.round((visited / countyPois.length) * 100);
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

const cityById = Object.fromEntries(CITIES.map((city) => [city.id, city]));

export function getCity(cityId: string): City | undefined {
  return cityById[cityId];
}

/** Cover image path for a city, falling back to the `/cities/<id>.jpg` convention. */
export function cityCover(city: City): string {
  return city.coverImage ?? `/cities/${city.id}.jpg`;
}

/** Cities inside a county, ordered by importance (major first). */
export function citiesForCounty(countyId: string): City[] {
  return CITIES.filter((city) => city.county_id === countyId).sort(
    (cityA, cityB) => cityA.importance - cityB.importance,
  );
}

/** The POIs that make up a city's "places to visit" list. */
export function poisForCity(cityId: string): POI[] {
  return POIS.filter((poi) => POI_CITY_ID[poi.id] === cityId);
}

/** County POIs that are NOT tied to a city (shown directly in the county panel). */
export function looseCountyPois(countyId: string): POI[] {
  return POIS.filter(
    (poi) => poi.county_id === countyId && !POI_CITY_ID[poi.id],
  );
}

/** A city's own explored percentage, from the status of its places to visit. */
export function getCityPercent(cityId: string, poiDataMap: POIDataMap): number {
  const pois = poisForCity(cityId);
  if (pois.length === 0) return 0;
  const visited = pois.filter(
    (poi) => poiDataMap[poi.id]?.status === "visited",
  ).length;
  return Math.round((visited / pois.length) * 100);
}
