// Shared test fixtures for the map feature. Prefer these factories over hand-writing objects in
// each test: they keep tests short, make the *relevant* field obvious (you only pass what matters),
// and shield every test from future shape changes — add a required field to POI and you fix it once
// here, not in fifty tests.
//
// Pattern: each factory returns a sensible default and shallow-merges an `overrides` patch, e.g.
//   makePoi({ owner_id: "user-1", county_id: "istria" })

import type { Feature, FeatureCollection, Position } from "geojson";
import type {
  City,
  POI,
  POIDataMap,
  POIRecord,
} from "@/features/map-explorer/types/types";

// ── Domain factories ────────────────────────────────────────────────────────────────────────────

/** A default (shared) POI drawn as a map pin. Override any field you're asserting on. */
export function makePoi(overrides: Partial<POI> = {}): POI {
  return {
    id: "poi-1",
    owner_id: null, // default POI; pass a user id to make it a custom one
    county_id: "istria",
    city_id: null,
    name: "Test POI",
    type: "mountain",
    description: "",
    lat: 45.1,
    lng: 15.2,
    ...overrides,
  };
}

/** A custom POI owned by a user — shortcut for makePoi with an owner. */
export function makeCustomPoi(
  ownerId: string,
  overrides: Partial<POI> = {},
): POI {
  return makePoi({ owner_id: ownerId, ...overrides });
}

export function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: "pula",
    name: "Pula",
    county_id: "istria",
    lat: 44.87,
    lng: 13.85,
    importance: 1,
    description: "",
    ...overrides,
  };
}

/** Build a POIDataMap from `poiId → status` (rating/notes default to null). */
export function makePoiDataMap(
  statuses: Record<string, POIRecord["status"]>,
): POIDataMap {
  const map: POIDataMap = {};
  for (const [id, status] of Object.entries(statuses)) {
    map[id] = { status, rating: null, date_visited: null, notes: null };
  }
  return map;
}

// ── GeoJSON builders (for geo.ts point-in-polygon / distance tests) ───────────────────────────────

/**
 * A closed rectangular Polygon feature from a bounding box, tagged with a `county_id`. Coordinates
 * are [lng, lat] per the GeoJSON spec. Synthetic boxes keep geo tests deterministic and fast — no
 * need to load the real multi-megabyte Croatia outline.
 */
export function makeBoxFeature(
  countyId: string,
  box: { minLng: number; minLat: number; maxLng: number; maxLat: number },
): Feature {
  const { minLng, minLat, maxLng, maxLat } = box;
  const ring: Position[] = [
    [minLng, minLat],
    [maxLng, minLat],
    [maxLng, maxLat],
    [minLng, maxLat],
    [minLng, minLat], // closed ring: last point repeats the first
  ];
  return {
    type: "Feature",
    properties: { county_id: countyId },
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}

export function makeFeatureCollection(features: Feature[]): FeatureCollection {
  return { type: "FeatureCollection", features };
}
