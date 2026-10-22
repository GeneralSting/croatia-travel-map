import { describe, expect, it } from "vitest";
import {
  countyBounds,
  findCountyId,
  isNearCroatia,
  pointInGeometry,
} from "./geo";
import {
  makeBoxFeature,
  makeFeatureCollection,
} from "@/features/map-explorer/test/fixtures";

/**
 * geo.ts guards a real bug class: it decides whether a dropped pin is inside Croatia and which county it belongs to.
 * A mistake here would let users place points in the open sea or attach them to the wrong county. We test with small
 * synthetic boxes so the maths is easy to reason about (coordinates are [lng, lat])
 */

// 1x1 box: longitude: 15 -> 16, latitude: 45 -> 46
const box = { minLng: 15, minLat: 45, maxLng: 16, maxLat: 46 };
const INSIDE = { lat: 45.5, lng: 15.5 };

describe("pointInGeometry", () => {
  it("is true inside the polygon and false outside", () => {
    const geom = makeBoxFeature("istria", box).geometry;
    expect(pointInGeometry(INSIDE.lat, INSIDE.lng, geom)).toBe(true);
    expect(pointInGeometry(40, 10, geom)).toBe(false);
  });
});

describe("isNearCroatia", () => {
  const outline = makeFeatureCollection([makeBoxFeature("hr", box)]);

  it("fails open when the outline hasn't loaded (never blocks placement)", () => {
    expect(isNearCroatia(0, 0, null)).toBe(true);
  });

  it("accepts a point inside the outline", () => {
    expect(isNearCroatia(INSIDE.lat, INSIDE.lng, outline)).toBe(true);
  });

  it("accepts a point just outside but within the tolerance (coastal cushion)", () => {
    // ~40 m east of the edge — outside the box, but well inside the 1 km default tolerance
    expect(isNearCroatia(45.5, 16.0005, outline)).toBe(true);
  });

  it("rejects a point far out to sea / abroad", () => {
    expect(isNearCroatia(45.5, 20, outline)).toBe(false);
  });

  it("respects a custom tolerance", () => {
    // ~2.3 km east of the edge: rejected at 1 km, accepted at 5 km
    expect(isNearCroatia(45.5, 16.03, outline, 1)).toBe(false);
    expect(isNearCroatia(45.5, 16.03, outline, 5)).toBe(true);
  });
});

describe("findCountyId", () => {
  // Two non-overlapping counties side by side
  const counties = makeFeatureCollection([
    makeBoxFeature("west", { minLng: 15, minLat: 45, maxLng: 16, maxLat: 46 }),
    makeBoxFeature("east", { minLng: 16, minLat: 45, maxLng: 17, maxLat: 46 }),
  ]);

  it("returns the county whose polygon contains the point", () => {
    expect(findCountyId(45.5, 15.5, counties, null)).toBe("west");
    expect(findCountyId(45.5, 16.5, counties, null)).toBe("east");
  });

  it("falls back to an island's county when the point is inside an island", () => {
    const islands = makeFeatureCollection([
      makeBoxFeature("island-county", {
        minLng: 20,
        minLat: 40,
        maxLng: 21,
        maxLat: 41,
      }),
    ]);
    expect(findCountyId(40.5, 20.5, counties, islands)).toBe("island-county");
  });

  it("falls back to the nearest county for a point just off every polygon", () => {
    // Just west of the 'west' box → nearest boundary is 'west'
    expect(findCountyId(45.5, 14.9, counties, null)).toBe("west");
  });

  it("returns null when no county geometry is available", () => {
    expect(findCountyId(45.5, 15.5, null, null)).toBeNull();
  });
});

describe("countyBounds", () => {
  const counties = makeFeatureCollection([
    makeBoxFeature("split", { minLng: 16, minLat: 43, maxLng: 17, maxLat: 44 }),
    makeBoxFeature("zadar", { minLng: 15, minLat: 44, maxLng: 16, maxLat: 45 }),
  ]);
  // An island of Split south-west of its mainland box - must be framed too
  const islands = makeFeatureCollection([
    makeBoxFeature("split", { minLng: 15.5, minLat: 42.5, maxLng: 15.8, maxLat: 42.8 }),
  ]);

  it("frames the county parcel together with its islands", () => {
    expect(countyBounds("split", counties, islands)).toEqual([
      [42.5, 15.5],
      [44, 17],
    ]);
  });

  it("ignores other counties and works without an islands layer", () => {
    expect(countyBounds("zadar", counties, null)).toEqual([
      [44, 15],
      [45, 16],
    ]);
  });

  it("returns null for an unknown county", () => {
    expect(countyBounds("nowhere", counties, islands)).toBeNull();
  });
});
