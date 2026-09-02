import { describe, expect, it } from "vitest";
import {
  citiesForCounty,
  countyDefaultPois,
  customPoisForCounty,
  getGradientColor,
  looseCountyPois,
  mappablePois,
  percentVisited,
  poisForCity,
} from "./selectors";
import {
  makeCity,
  makeCustomPoi,
  makePoi,
  makePoiDataMap,
} from "@/features/map-explorer/test/fixtures";

/**
 * These pure functions encode the map's real rules: which POIs are pins, which belong to a city or county,
 * and how "explored (%)" is computed. They take plain data in and return data out.
 */

describe("mappablePois", () => {
  it("keeps only POIs that have coordinates and no city", () => {
    const pin = makePoi({ id: "pin", lat: 45, lng: 15, city_id: null });
    const inCity = makePoi({ id: "in-city", city_id: "pula" });
    const noCoords = makePoi({ id: "no-coords", lat: null, lng: null });

    const result = mappablePois([pin, inCity, noCoords]);

    expect(result.map((p) => p.id)).toEqual(["pin"]);
  });
});

describe("poisForCity", () => {
  it("returns only POIs attached to the given city", () => {
    const a = makePoi({ id: "a", city_id: "pula" });
    const b = makePoi({ id: "b", city_id: "rijeka" });
    const c = makePoi({ id: "c", city_id: "pula" });

    expect(poisForCity([a, b, c], "pula").map((p) => p.id)).toEqual(["a", "c"]);
  });
});

describe("looseCountyPois", () => {
  it("returns default county POIs that are not tied to a city", () => {
    const loose = makePoi({ id: "loose", county_id: "istria", city_id: null });
    const inCity = makePoi({
      id: "in-city",
      county_id: "istria",
      city_id: "pula",
    });
    const otherCounty = makePoi({
      id: "other",
      county_id: "zadar",
      city_id: null,
    });

    const result = looseCountyPois([loose, inCity, otherCounty], "istria");

    expect(result.map((p) => p.id)).toEqual(["loose"]);
  });
});

describe("customPoisForCounty", () => {
  it("returns only the user's own POIs in that county", () => {
    const mine = makeCustomPoi("user-1", { id: "mine", county_id: "istria" });
    const mineElsewhere = makeCustomPoi("user-1", {
      id: "elsewhere",
      county_id: "zadar",
    });
    const aDefault = makePoi({ id: "default", county_id: "istria" }); // owner_id null

    const result = customPoisForCounty(
      [mine, mineElsewhere, aDefault],
      "istria",
    );

    expect(result.map((p) => p.id)).toEqual(["mine"]);
  });
});

describe("countyDefaultPois", () => {
  it("returns every default POI in the county (city-attached included)", () => {
    const loose = makePoi({ id: "loose", county_id: "istria", city_id: null });
    const inCity = makePoi({
      id: "in-city",
      county_id: "istria",
      city_id: "pula",
    });
    const other = makePoi({ id: "other", county_id: "zadar" });

    const result = countyDefaultPois([loose, inCity, other], "istria");

    expect(result.map((p) => p.id).sort()).toEqual(["in-city", "loose"]);
  });
});

describe("citiesForCounty", () => {
  it("filters to the county and sorts major (importance 1) first", () => {
    const minor = makeCity({ id: "minor", county_id: "istria", importance: 3 });
    const major = makeCity({ id: "major", county_id: "istria", importance: 1 });
    const other = makeCity({ id: "other", county_id: "zadar", importance: 1 });

    const result = citiesForCounty([minor, major, other], "istria");

    expect(result.map((c) => c.id)).toEqual(["major", "minor"]);
  });
});

describe("percentVisited", () => {
  it("is 0 for an empty set (avoids divide-by-zero)", () => {
    expect(percentVisited([], {})).toBe(0);
  });

  it("counts only 'visited' status and rounds to a whole percent", () => {
    const pois = [
      makePoi({ id: "a" }),
      makePoi({ id: "b" }),
      makePoi({ id: "c" }),
    ];
    const data = makePoiDataMap({ a: "visited", b: "want_to_visit" }); // c has no record

    expect(percentVisited(pois, data)).toBe(33); // 1 of 3
  });

  it("is 100 when every POI is visited", () => {
    const pois = [makePoi({ id: "a" }), makePoi({ id: "b" })];
    expect(
      percentVisited(pois, makePoiDataMap({ a: "visited", b: "visited" })),
    ).toBe(100);
  });
});

describe("getGradientColor", () => {
  it("returns the neutral slate at 0%", () => {
    expect(getGradientColor(0)).toBe("#334155");
  });

  it("returns a valid #rrggbb hex across the whole range", () => {
    for (const percent of [1, 25, 40, 50, 75, 90, 100]) {
      expect(getGradientColor(percent)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
