// Point-in-polygon + distance helpers used to validate where a user drops a new place, against
// a detailed Croatia outline (public/geo/croatia-outline.geojson — mainland + islands). A point
// is accepted if it is inside the outline OR within a small tolerance of it (the shoreline is
// still slightly generalised, so a 1 km cushion keeps every real coastal/island spot valid while
// rejecting the open sea / abroad).

import type { Feature, FeatureCollection, Geometry, Position } from "geojson";

function pointInRing(lng: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(lng: number, lat: number, poly: Position[][]): boolean {
  if (!poly.length || !pointInRing(lng, lat, poly[0])) return false;
  // Rings after the first are holes.
  for (let k = 1; k < poly.length; k++) {
    if (pointInRing(lng, lat, poly[k])) return false;
  }
  return true;
}

function polygonsOf(geom: Geometry): Position[][][] {
  if (geom.type === "Polygon") return [geom.coordinates];
  if (geom.type === "MultiPolygon") return geom.coordinates;
  return [];
}

export function pointInGeometry(lat: number, lng: number, geom: Geometry): boolean {
  return polygonsOf(geom).some((poly) => pointInPolygon(lng, lat, poly));
}

const KM_PER_DEG = 111;

// Great-circle-ish distance from a point to a segment, in km (equirectangular approximation,
// fine at these small distances / latitudes).
function segmentDistanceKm(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax, dy = by - ay;
  const len = dx * dx + dy * dy;
  let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  const kx = Math.cos((py * Math.PI) / 180); // longitude compression at this latitude
  return Math.hypot((px - cx) * kx, py - cy) * KM_PER_DEG;
}

function geometryDistanceKm(lat: number, lng: number, geom: Geometry): number {
  let min = Infinity;
  for (const poly of polygonsOf(geom)) {
    for (const ring of poly) {
      for (let i = 0; i < ring.length - 1; i++) {
        min = Math.min(
          min,
          segmentDistanceKm(lng, lat, ring[i][0], ring[i][1], ring[i + 1][0], ring[i + 1][1]),
        );
      }
    }
  }
  return min;
}

/**
 * True if (lat,lng) is on Croatian land (per the outline) or within `tolKm` of it. With the
 * detailed outline, 1 km accepts every real coastal/island POI in the dataset while still
 * rejecting clicks out to sea or across the border. Fails open if the outline hasn't loaded yet,
 * so placement is never blocked by a missing asset.
 */
export function isNearCroatia(
  lat: number,
  lng: number,
  outline: FeatureCollection | null,
  tolKm = 1,
): boolean {
  if (!outline) return true;
  for (const f of outline.features) {
    if (!f.geometry) continue;
    if (pointInGeometry(lat, lng, f.geometry)) return true;
    if (geometryDistanceKm(lat, lng, f.geometry) <= tolKm) return true;
  }
  return false;
}

/**
 * The county a dropped pin belongs to. Now that a place can be added anywhere (no county is
 * chosen up front), we infer it from the coordinates: the county whose polygon contains the
 * point, or — for a click on an island / just off the coast — the county of the containing
 * island, falling back to the nearest county boundary. Returns null only if no county geometry
 * is available yet.
 */
export function findCountyId(
  lat: number,
  lng: number,
  counties: FeatureCollection | null,
  islands: FeatureCollection | null,
): string | null {
  const idOf = (f: Feature): string | null =>
    (f.properties as { county_id?: string } | null)?.county_id ?? null;

  // 1) Inside a county polygon.
  for (const f of counties?.features ?? []) {
    if (f.geometry && pointInGeometry(lat, lng, f.geometry) && idOf(f)) {
      return idOf(f);
    }
  }
  // 2) Inside an island polygon → that island's county.
  for (const f of islands?.features ?? []) {
    if (f.geometry && pointInGeometry(lat, lng, f.geometry) && idOf(f)) {
      return idOf(f);
    }
  }
  // 3) Nearest county / island boundary (covers coastal clicks just outside every polygon).
  let bestId: string | null = null;
  let best = Infinity;
  for (const fc of [counties, islands]) {
    for (const f of fc?.features ?? []) {
      const id = idOf(f);
      if (!f.geometry || !id) continue;
      const d = geometryDistanceKm(lat, lng, f.geometry);
      if (d < best) {
        best = d;
        bestId = id;
      }
    }
  }
  return bestId;
}
