import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMapControlStore } from "@/features/map-explorer/store/mapControlStore";
import { makeCity, makePoi } from "@/features/map-explorer/test/fixtures";
import type { County, MapControlStoreApi, POIDataMap } from "@/features/map-explorer";
import { createVoiceTools, type VoiceToolDeps } from "./createVoiceTools";

/**
 * The tools are plain functions, so each test asserts both sides of a call: the JSON the agent gets
 * back, and what happened to the (real) map-control store - the panel opened, the camera request,
 * the highlights
 */

const COUNTIES: County[] = [
  { id: "osijek-baranja", name: "Osijek-Baranja" },
  { id: "pozega-slavonia", name: "Požega-Slavonia" },
  { id: "istria", name: "Istria County" },
  { id: "lika-senj", name: "Lika-Senj" },
  { id: "split-dalmatia", name: "Split-Dalmatia" },
  { id: "zagreb-city", name: "City of Zagreb" },
];

const CITIES = [
  makeCity({ id: "osijek", name: "Osijek", county_id: "osijek-baranja", lat: 45.555, lng: 18.6955, importance: 1 }),
  makeCity({ id: "dakovo", name: "Đakovo", county_id: "osijek-baranja", lat: 45.3089, lng: 18.4097, importance: 2 }),
  makeCity({ id: "pula", name: "Pula", county_id: "istria", lat: 44.8666, lng: 13.8496, importance: 1 }),
  makeCity({ id: "split", name: "Split", county_id: "split-dalmatia", lat: 43.5081, lng: 16.4403, importance: 1 }),
  makeCity({ id: "zagreb", name: "Zagreb", county_id: "zagreb-city", lat: 45.815, lng: 15.982, importance: 1 }),
];

const POIS = [
  makePoi({ id: "plitvice-lakes", name: "Plitvice Lakes NP", type: "national_park", county_id: "lika-senj", lat: 44.8806, lng: 15.6167, description: "UNESCO site, 16 terraced lakes" }),
  makePoi({ id: "kopacki-rit", name: "Kopački Rit", type: "nature", county_id: "osijek-baranja", lat: 45.6, lng: 18.85 }),
  // Listed inside the Zagreb city panel, no pin of its own
  makePoi({ id: "zagreb-old-town", name: "Zagreb Old Town", type: "city", county_id: "zagreb-city", city_id: "zagreb", lat: null, lng: null }),
  makePoi({ id: "my-cabin", name: "Grandpa's Cabin", type: "landmark", county_id: "istria", owner_id: "user-1", lat: 45.1, lng: 13.9 }),
];

let store: MapControlStoreApi;
let updatePoi: ReturnType<typeof vi.fn<VoiceToolDeps["updatePoi"]>>;

function tools(overrides: Partial<VoiceToolDeps> = {}) {
  return createVoiceTools({
    cities: CITIES,
    pois: POIS,
    counties: COUNTIES,
    store,
    signedIn: true,
    poiDataMap: {},
    countyPercents: {},
    updatePoi,
    ...overrides,
  });
}

const parse = (result: string) => JSON.parse(result);

beforeEach(() => {
  store = createMapControlStore();
  updatePoi = vi.fn<VoiceToolDeps["updatePoi"]>();
});

describe("search_places", () => {
  it("finds a city from a declined Croatian form ('u Osijeku')", () => {
    const result = parse(tools().search_places({ query: "Osijeku" }));
    expect(result.ok).toBe(true);
    expect(result.results[0]).toMatchObject({ id: "osijek", kind: "city" });
  });

  it("matches across languages through a shared word ('Plitvička jezera')", () => {
    const result = parse(tools().search_places({ query: "Plitvička jezera" }));
    expect(result.results[0].id).toBe("plitvice-lakes");
  });

  it("filters by region and category ('a city in the east')", () => {
    const result = parse(tools().search_places({ region: "slavonija", category: "city" }));
    expect(result.results.map((r: { id: string }) => r.id)).toEqual(["osijek", "dakovo"]);
  });

  it("treats 'Slavonija' passed as a county as the region, not the county Požega-Slavonia", () => {
    const result = parse(tools().search_places({ county: "Slavonija", category: "city" }));
    expect(result.results.map((r: { id: string }) => r.id)).toEqual(["osijek", "dakovo"]);
  });

  it("searches around a place, closest first, without the place itself", () => {
    const result = parse(tools().search_places({ near: "osijek", radiusKm: "60" }));
    const ids = result.results.map((r: { id: string }) => r.id);
    expect(ids).toEqual(["kopacki-rit", "dakovo"]); // Kopački Rit ~14 km, Đakovo ~33 km; Split is far
    expect(result.results[0].distance_km).toBeGreaterThan(0);
  });

  it("reports the user's own progress and custom places", () => {
    const result = parse(
      tools({ poiDataMap: { "plitvice-lakes": { status: "visited" } } }).search_places({
        query: "",
        county: "",
        limit: 20,
      }),
    );
    const byId = Object.fromEntries(result.results.map((r: { id: string }) => [r.id, r]));
    expect(byId["plitvice-lakes"].status).toBe("visited");
    expect(byId["my-cabin"].mine).toBe(true);
  });

  it("leaves out visited places when asked to (for recommendations)", () => {
    const result = parse(
      tools({ poiDataMap: { "kopacki-rit": { status: "visited" } } }).search_places({
        near: "osijek",
        radiusKm: 60,
        excludeVisited: true,
      }),
    );
    expect(result.results.map((r: { id: string }) => r.id)).toEqual(["dakovo"]);
  });

  it("explains invalid parameters instead of throwing", () => {
    const result = parse(tools().search_places({ limit: 500 }));
    expect(result).toMatchObject({ ok: false, error: "invalid_parameters" });
    expect(result.details[0]).toContain("limit");
  });
});

describe("show_place", () => {
  it("opens a city's panel and flies the camera to it", () => {
    const result = parse(tools().show_place({ placeId: "osijek" }));

    expect(result).toMatchObject({ ok: true, shown: { name: "Osijek" } });
    expect(store.getState().view).toEqual({ kind: "city", cityId: "osijek", countyId: "osijek-baranja" });
    expect(store.getState().camera?.target).toMatchObject({ kind: "point", lat: 45.555, lng: 18.6955 });
    expect(store.getState().viewSource).toBe("api"); // not echoed back to the agent as a user action
  });

  it("opens a POI's panel", () => {
    tools().show_place({ placeId: "plitvice-lakes" });
    expect(store.getState().view).toMatchObject({ kind: "poi", poiId: "plitvice-lakes" });
  });

  it("opens the parent city for a place that has no pin of its own", () => {
    const result = parse(tools().show_place({ placeId: "zagreb-old-town" }));

    expect(result.note).toContain("Zagreb");
    expect(store.getState().view).toMatchObject({ kind: "city", cityId: "zagreb" });
    expect([...store.getState().highlightedIds]).toEqual(["zagreb"]);
  });

  it("refuses an unknown id and tells the agent to search first - the map stays untouched", () => {
    const result = parse(tools().show_place({ placeId: "atlantis" }));

    expect(result).toMatchObject({ ok: false, error: "unknown_place" });
    expect(result.message).toContain("search_places");
    expect(store.getState().view).toBeNull();
  });
});

describe("focus_county", () => {
  it("accepts the Croatian county name and frames the county", () => {
    const result = parse(tools({ countyPercents: { istria: 40 } }).focus_county({ countyId: "Istarska županija" }));

    expect(result).toMatchObject({ ok: true, county: { id: "istria" }, explored_percent: 40 });
    expect(store.getState().camera?.target).toEqual({ kind: "county", countyId: "istria" });
  });

  it("explains that a region isn't a county", () => {
    expect(parse(tools().focus_county({ countyId: "Dalmacija" }))).toMatchObject({
      ok: false,
      error: "is_region",
    });
  });
});

describe("highlight_places", () => {
  it("highlights known places (comma-separated ids accepted), reports unknown ones, fits the camera", () => {
    const result = parse(tools().highlight_places({ placeIds: "osijek, kopacki-rit, nope" }));

    expect(result).toMatchObject({ ok: true, highlighted: ["Osijek", "Kopački Rit"], unknown: ["nope"] });
    expect([...store.getState().highlightedIds]).toEqual(["osijek", "kopacki-rit"]);
    expect(store.getState().camera?.target.kind).toBe("points");
  });

  it("clears highlights with an empty list", () => {
    store.getState().highlightPlaces(["osijek"]);
    expect(parse(tools().highlight_places({ placeIds: [] }))).toMatchObject({ ok: true, cleared: true });
    expect(store.getState().highlightedIds.size).toBe(0);
  });
});

describe("add_to_wishlist", () => {
  it("refuses without the user's confirmation and says what to ask", () => {
    const result = parse(tools().add_to_wishlist({ placeId: "plitvice-lakes", confirmed: false }));

    expect(result).toMatchObject({ ok: false, error: "confirmation_required" });
    expect(result.message).toContain("Plitvice Lakes NP");
    expect(updatePoi).not.toHaveBeenCalled();
  });

  it("adds a confirmed place and keeps the notes the user already saved", () => {
    const poiDataMap: POIDataMap = { "plitvice-lakes": { status: "not_visited", notes: "go in spring" } };
    const result = parse(tools({ poiDataMap }).add_to_wishlist({ placeId: "plitvice-lakes", confirmed: "true" }));

    expect(result).toMatchObject({ ok: true, status: "added" });
    expect(updatePoi).toHaveBeenCalledWith("plitvice-lakes", {
      status: "want_to_visit",
      notes: "go in spring",
    });
  });

  it("never downgrades a visited place", () => {
    const result = parse(
      tools({ poiDataMap: { "plitvice-lakes": { status: "visited" } } }).add_to_wishlist({
        placeId: "plitvice-lakes",
        confirmed: true,
      }),
    );
    expect(result).toMatchObject({ ok: false, error: "already_visited" });
    expect(updatePoi).not.toHaveBeenCalled();
  });

  it("offers a city's places instead of the city itself", () => {
    const result = parse(tools().add_to_wishlist({ placeId: "zagreb", confirmed: true }));
    expect(result).toMatchObject({ ok: false, error: "not_a_place" });
    expect(result.city_places).toEqual([{ id: "zagreb-old-town", name: "Zagreb Old Town" }]);
  });

  it("requires a signed-in user", () => {
    const result = parse(tools({ signedIn: false }).add_to_wishlist({ placeId: "plitvice-lakes", confirmed: true }));
    expect(result).toMatchObject({ ok: false, error: "not_signed_in" });
  });
});

describe("get_user_progress", () => {
  it("needs a signed-in user", () => {
    expect(parse(tools({ signedIn: false }).get_user_progress({}))).toMatchObject({
      ok: false,
      error: "not_signed_in",
    });
  });

  it("summarises progress per region and lists untouched counties", () => {
    const result = parse(
      tools({
        poiDataMap: {
          "plitvice-lakes": { status: "visited" },
          "kopacki-rit": { status: "want_to_visit" },
        },
        countyPercents: { "lika-senj": 100, istria: 0 },
      }).get_user_progress({}),
    );

    expect(result.totals).toEqual({ visited: 1, want_to_visit: 1 });
    expect(result.wishlist).toEqual([{ id: "kopacki-rit", name: "Kopački Rit", county: "Osječko-baranjska županija" }]);
    expect(result.not_started_counties).toContain("Istarska županija");
    expect(result.not_started_counties).not.toContain("Ličko-senjska županija");

    // Lika is fully explored, so it isn't among the emptiest regions; its region reports 100 %
    expect(result.least_explored_regions.map((r: { region: string }) => r.region)).not.toContain("lika");
    expect(result.regions.find((r: { region: string }) => r.region === "lika").explored_percent).toBe(100);
  });
});

it("turns an unexpected exception into a normal failure result", () => {
  const brokenStore = {
    getState: () => {
      throw new Error("boom");
    },
  } as unknown as MapControlStoreApi;

  const result = parse(tools({ store: brokenStore }).show_place({ placeId: "osijek" }));
  expect(result).toMatchObject({ ok: false, error: "internal_error" });
});
