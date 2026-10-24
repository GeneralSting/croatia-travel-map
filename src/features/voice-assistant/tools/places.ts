import type { City, POI, PoiType } from "@/features/map-explorer";
import { REGIONS, type RegionId } from "./regions";
import { fullMatch, matchScore, queryWords, wordScore } from "./text";

/**
 * One searchable list of everything the agent can talk about: the cities table and the POIs table
 * (shared defaults + the user's own). A POI that belongs to a city may have no coordinates of its
 * own - it borrows its city's, so distance search and "show on map" still work for it
 */
export interface Place {
  id: string;
  kind: "city" | "poi";
  name: string;
  type: PoiType;
  countyId: string;
  cityId: string | null;
  lat: number | null;
  lng: number | null;
  ownCoordinates: boolean; // false when lat/lng were borrowed from the parent city
  description: string;
  mine: boolean; // the user's custom place
  importance: number; // lower ranks first: cities 1 (major) to 3, then POIs by type (POI_TYPE_RANK)
}

/**
 * Ranking among equally good matches: cities (importance 1-3) first, then the places people travel
 * for, then campsites - so "Zadar" lists the city before "Falkensteiner Camping Zadar"
 */
const POI_TYPE_RANK: Record<PoiType, number> = {
  national_park: 4,
  landmark: 4.2,
  nature: 4.3,
  island: 4.3,
  lake: 4.4,
  river: 4.5,
  mountain: 4.5,
  city: 4.6,
  campsite: 5,
};

export function buildPlaceIndex(cities: City[], pois: POI[]): Place[] {
  const cityById = new Map(cities.map((city) => [city.id, city]));

  const cityPlaces: Place[] = cities.map((city) => ({
    id: city.id,
    kind: "city",
    name: city.name,
    type: "city",
    countyId: city.county_id,
    cityId: null,
    lat: city.lat,
    lng: city.lng,
    ownCoordinates: true,
    description: city.description,
    mine: false,
    importance: city.importance,
  }));

  const poiPlaces: Place[] = pois.map((poi) => {
    const hasOwn = typeof poi.lat === "number" && typeof poi.lng === "number";
    const parent = poi.city_id ? cityById.get(poi.city_id) : undefined;
    return {
      id: poi.id,
      kind: "poi",
      name: poi.name,
      type: poi.type,
      countyId: poi.county_id,
      cityId: poi.city_id,
      lat: hasOwn ? (poi.lat as number) : (parent?.lat ?? null),
      lng: hasOwn ? (poi.lng as number) : (parent?.lng ?? null),
      ownCoordinates: hasOwn,
      description: poi.description,
      mine: poi.owner_id != null,
      importance: POI_TYPE_RANK[poi.type] ?? 5,
    };
  });

  return [...cityPlaces, ...poiPlaces];
}

// Great-circle distance in km (haversine) - accurate enough for "near Osijek" at any range
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const DESCRIPTION_WEIGHT = 0.5; // a keyword in the description counts for less than one in the name

/**
 * Per query word: its match in the name, or (at half weight) in the description - averaged. So
 * "Krka slapovi" ranks Krka National Park (name: Krka, description: waterfalls) above the town Krk
 */
function placeScore(place: Place, query: string): number {
  const asked = queryWords(query);
  if (!asked.length) return 0;
  const nameWords = queryWords(place.name);
  const descriptionWords = queryWords(place.description);
  const total = asked.reduce(
    (sum, word) =>
      sum +
      Math.max(
        wordScore(word, nameWords),
        wordScore(word, descriptionWords) * DESCRIPTION_WEIGHT,
      ),
    0,
  );
  return total / asked.length;
}

/**
 * Find a place by exact id first (what the agent gets back from search_places), then by name - so a
 * tool still works when the agent passes "Osijek" instead of "osijek"
 */
export function resolvePlace(places: Place[], idOrName: string): Place | null {
  const exact = places.find((place) => place.id === idOrName);
  if (exact) return exact;

  // Only places matching every word qualify - a partial match would show the wrong place
  let best: Place | null = null;
  let bestScore = 0;
  for (const place of places) {
    if (!fullMatch(place.name, idOrName)) continue;
    const score = matchScore(place.name, idOrName);
    // Ties go to the more important place (a city over a POI that shares its name)
    if (score > bestScore || (score === bestScore && best && place.importance < best.importance)) {
      best = place;
      bestScore = score;
    }
  }
  return best;
}

export interface SearchCriteria {
  query?: string;
  countyIds?: string[]; // already resolved by the caller
  region?: RegionId;
  category?: PoiType;
  near?: { lat: number; lng: number; excludeId: string; radiusKm: number };
  excludeIds?: ReadonlySet<string>; // e.g. places the user already visited
  limit: number;
}

export interface SearchHit {
  place: Place;
  distanceKm?: number;
}

export function searchPlaces(places: Place[], criteria: SearchCriteria) {
  const regionCounties: readonly string[] | null = criteria.region
    ? REGIONS[criteria.region].counties
    : null;

  const hits: (SearchHit & { score: number })[] = [];
  for (const place of places) {
    if (criteria.excludeIds?.has(place.id)) continue;
    if (criteria.category && place.type !== criteria.category) continue;
    if (criteria.countyIds && !criteria.countyIds.includes(place.countyId)) continue;
    if (regionCounties && !regionCounties.includes(place.countyId)) continue;

    const score = criteria.query ? placeScore(place, criteria.query) : 1;
    if (score === 0) continue;

    let distance: number | undefined;
    if (criteria.near) {
      if (place.id === criteria.near.excludeId || place.lat == null || place.lng == null) continue;
      distance = distanceKm(criteria.near, { lat: place.lat, lng: place.lng });
      if (distance > criteria.near.radiusKm) continue;
    }
    hits.push({ place, score, distanceKm: distance });
  }

  // Best match first; with a "near" filter, closest first; then cities by importance, then by name
  hits.sort(
    (a, b) =>
      b.score - a.score ||
      (a.distanceKm ?? 0) - (b.distanceKm ?? 0) ||
      a.place.importance - b.place.importance ||
      a.place.name.localeCompare(b.place.name, "hr"),
  );

  return { total: hits.length, hits: hits.slice(0, criteria.limit) };
}

