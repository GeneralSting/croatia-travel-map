import { test, expect } from "@playwright/test";
import { callMapControl, getMapView, waitForMap } from "./helpers/map";

/**
 * The map-control store's programmatic API, driven in a real browser: each action must open the right
 * panel AND move the real Leaflet camera. Nothing in the UI calls these yet (the voice tools will), so
 * this is what proves the store -> MapCameraController -> Leaflet path works end to end
 *
 * Guests can use the map, so no session is needed. Reduced motion makes the camera jump instead of
 * animating - deterministic for assertions, and it exercises the reduced-motion branch. It must go
 * through contextOptions: a bare `reducedMotion` key in test.use() is silently ignored by the runner
 */
test.use({
  storageState: { cookies: [], origins: [] },
  contextOptions: { reducedMotion: "reduce" },
});

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // For guests the add control is a sign-in *link*. Generous timeout: the first hit cold-compiles the
  // route and fetches all map data from Supabase
  await expect(
    page.getByRole("link", { name: "Sign in to add a place" }),
  ).toBeVisible({ timeout: 45_000 });
  await waitForMap(page);
});

test.describe("map control API", () => {
  test("focusCounty opens the county panel and frames the county", async ({
    page,
  }) => {
    await callMapControl(page, "focusCounty", "istria");

    await expect(page.getByRole("heading", { name: "Istria County" })).toBeVisible();
    const view = await getMapView(page);
    expect(view.zoom).toBeGreaterThan(7); // zoomed in from the whole-country view
    // Centre lands on the Istrian peninsula
    expect(view.lat).toBeGreaterThan(44.8);
    expect(view.lat).toBeLessThan(45.6);
    expect(view.lng).toBeGreaterThan(13.4);
    expect(view.lng).toBeLessThan(14.4);
  });

  test("showPoi opens the POI panel and flies to the place", async ({ page }) => {
    await callMapControl(page, "showPoi", {
      id: "plitvice-lakes",
      countyId: "lika-senj",
      lat: 44.8806,
      lng: 15.6167,
    });

    await expect(
      page.getByRole("heading", { name: "Plitvice Lakes NP" }),
    ).toBeVisible();
    const view = await getMapView(page);
    expect(view.zoom).toBe(11);
    expect(view.lat).toBeCloseTo(44.8806, 2);
    expect(view.lng).toBeCloseTo(15.6167, 2);
  });

  test("highlightPlaces shows a highlighted pin even when zoomed out", async ({
    page,
  }) => {
    // At the initial zoom (7) POI pins are hidden by the zoom reveal - a highlight must bypass it
    await expect(page.locator(".cx-poi-pin--hl")).toHaveCount(0);
    await callMapControl(page, "highlightPlaces", ["plitvice-lakes"]);
    await expect(page.locator(".cx-poi-pin--hl")).toHaveCount(1);

    await callMapControl(page, "clearHighlights");
    await expect(page.locator(".cx-poi-pin--hl")).toHaveCount(0);
  });
});
