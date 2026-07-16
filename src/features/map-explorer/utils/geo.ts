// Point-in-polygon + distance helpers used to validate where a user drops a new place, against
// a detailed Croatia outline (public/geo/croatia-outline.geojson — mainland + islands). A point
// is accepted if it is inside the outline OR within a small tolerance of it (the shoreline is
// still slightly generalised, so a 1 km cushion keeps every real coastal/island spot valid while
// rejecting the open sea / abroad).

import type { FeatureCollection, Geometry, Position } from "geojson";

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
