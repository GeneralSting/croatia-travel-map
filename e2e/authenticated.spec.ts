import { test, expect } from "@playwright/test";
import { clickMapAt, setView, waitForMap } from "./helpers/map";

/**
 * These tests reuse the saved login session (storageState from auth.setup.ts, wired in the chromium project).
 * No per-test login needed - the user is already signed in
 */

// A rural point in central Croatia (Moslavina): solidly inland so the "is it in Croatia?" check
// accepts it, and empty of city/POI markers at low zoom so the click reaches the map, not a marker.
const INLAND = { lat: 45.4, lng: 16.2 };

test.describe("signed-in user", () => {
  test("is redirected away from /login by the public-route guard", async ({
    page,
  }) => {
    /**
     * Full-stack assertion: PublicAuthGuard runs on the server, sees the session cookie, and bounces
     * a logged-in user off the auth pages back to the map
     */
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("can stay on the map home", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  /**
   * Touches the whole stack: a real map click and isnert into POIs under RLS - an optimistic UI update
   * - persistence across a reload -> delete. Leaflet renders to an overlay and POI pins only appear
   * when zoomed in, so we drive the map deterministically through the dev-only bridge
   * (window.leafletMap, added in MapCanvas) instead of guessing pixels
   */
  test("adds a custom POI that persists across reload, then deletes it", async ({
    page,
  }) => {
    const poiName = `E2E Peak ${Date.now()}`; // unique so the heading assertion can't match anything else

    await page.goto("/");
    const addButton = page.getByRole("button", { name: "Add location" });
    // Generous: the first hit cold-compiles the route and fetches all map data from Supabase
    await expect(addButton).toBeVisible({ timeout: 45_000 });
    await waitForMap(page);

    /**
     * 1)
     * Enter placement mode (confirm the pill shows), then drop a pin on empty inland Croatia.
     * We capture the exact lat/lng Leaflet resolves for the pixel, to find the same spot post-reload
     */
    await addButton.click();
    await expect(
      page.getByText(/click the map to drop your pin/i),
    ).toBeVisible();
    const created = await clickMapAt(page, INLAND);

    /**
     * 2)
     * Fill the popup form. Wait for the insert to actually reach the DB before moving on, so the
     * reload below is a real persistence check and not a race
     */
    await page.getByPlaceholder(/name/i).fill(poiName);
    const inserted = page.waitForResponse(
      (response) =>
        response.url().includes("/rest/v1/pois") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Confirm" }).click();
    expect((await inserted).ok()).toBeTruthy();

    // 3) The POI's detail panel opens immediately — creation went through
    await expect(page.getByRole("heading", { name: poiName })).toBeVisible();

    /**
     * 4)
     * Persistence: reload, zoom in so the pin renders, click it - the panel returns, so the row
     * really came back from the database
     */
    await page.reload();
    await expect(addButton).toBeVisible({ timeout: 45_000 });
    await waitForMap(page);
    await setView(page, created, 12);
    await clickMapAt(page, created);
    await expect(page.getByRole("heading", { name: poiName })).toBeVisible();

    // 5) Delete it through the UI (global-teardown would also remove it with the user)
    await page.getByRole("button", { name: /delete this place/i }).click();
    await expect(page.getByRole("heading", { name: poiName })).toHaveCount(0);
  });
});
