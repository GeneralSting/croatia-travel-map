import { describe, expect, it } from "vitest";
import { createMapControlStore, FOCUS_ZOOM } from "./mapControlStore";

/**
 * The store is plain data + actions, so it is tested directly - no React, no Leaflet. These are the
 * contracts the voice tools will rely on: each programmatic action opens the right panel AND queues
 * the right camera move
 */

const PLACE = { id: "plitvice", countyId: "lika-senj", lat: 44.88, lng: 15.62 };

describe("mapControlStore", () => {
  it("showPoi opens the POI panel and requests a fly-to at focus zoom", () => {
    const store = createMapControlStore();
    store.getState().showPoi(PLACE);

    const { view, camera } = store.getState();
    expect(view).toEqual({ kind: "poi", poiId: "plitvice", countyId: "lika-senj" });
    expect(camera?.target).toEqual({
      kind: "point",
      lat: 44.88,
      lng: 15.62,
      zoom: FOCUS_ZOOM,
    });
  });

  it("showCity opens the city panel", () => {
    const store = createMapControlStore();
    store.getState().showCity({ ...PLACE, id: "gospic" });

    expect(store.getState().view).toEqual({
      kind: "city",
      cityId: "gospic",
      countyId: "lika-senj",
    });
  });

  it("focusCounty opens the county panel and requests a county fit", () => {
    const store = createMapControlStore();
    store.getState().focusCounty("istria");

    expect(store.getState().view).toEqual({ kind: "county", countyId: "istria" });
    expect(store.getState().camera?.target).toEqual({
      kind: "county",
      countyId: "istria",
    });
  });

  it("bumps the camera seq on every request, even for the same target", () => {
    const store = createMapControlStore();
    store.getState().focusCounty("istria");
    const first = store.getState().camera?.seq ?? 0;
    store.getState().focusCounty("istria");

    // Same target twice must still be a *new* request, or the camera would ignore the repeat
    expect(store.getState().camera?.seq).toBe(first + 1);
  });

  it("fitPoints ignores an empty list", () => {
    const store = createMapControlStore();
    store.getState().fitPoints([]);
    expect(store.getState().camera).toBeNull();
  });

  it("showOnlyTypes hides every other type; showAllTypes restores them", () => {
    const store = createMapControlStore();
    store.getState().showOnlyTypes(["lake"], ["lake", "mountain", "city"]);
    expect([...store.getState().hiddenTypes].sort()).toEqual(["city", "mountain"]);

    store.getState().showAllTypes();
    expect(store.getState().hiddenTypes.size).toBe(0);
  });

  it("highlightPlaces replaces the highlighted set; clearHighlights empties it", () => {
    const store = createMapControlStore();
    store.getState().highlightPlaces(["a", "b"]);
    store.getState().highlightPlaces(["c"]);
    expect([...store.getState().highlightedIds]).toEqual(["c"]);

    store.getState().clearHighlights();
    expect(store.getState().highlightedIds.size).toBe(0);
  });

  it("records whether the user or the programmatic API changed the view", () => {
    const store = createMapControlStore();
    store.getState().showPoi(PLACE);
    expect(store.getState().viewSource).toBe("api");

    store.getState().setView(null); // e.g. the user closes the panel
    expect(store.getState().viewSource).toBe("user");
  });

  it("each store instance has its own state (one per mounted map)", () => {
    const a = createMapControlStore();
    const b = createMapControlStore();
    a.getState().focusCounty("istria");
    expect(b.getState().view).toBeNull();
  });
});
