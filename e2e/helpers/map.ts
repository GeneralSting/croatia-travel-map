import type { Page } from "@playwright/test";

/**
 * Map-driving helpers for E2E tests. Leaflet renders to a canvas/overlay and POI pins only appear at
 * higher zooms, so we can't reliably click a coordinate by guessing pixels. Instead we drive the map
 * through the dev-only `window.__leafletMap` bridge (added in MapCanvas), which lets us convert a
 * known lat/lng to the exact container pixel and back — deterministically
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Tiny slice of the Leaflet map API the tests use.
 * Type-only - reased at runtime, so it's safe to reference inside page.evaluate (which runs in the browser)
 */
interface MapBridge {
  latLngToContainerPoint(ll: [number, number]): { x: number; y: number };
  containerPointToLatLng(pt: [number, number]): { lat: number; lng: number };
  setView(
    ll: [number, number],
    zoom: number,
    opts?: { animate?: boolean },
  ): void;
}

// Resolve once the dev-only map bridge is exposed on the page
export function waitForMap(page: Page) {
  return page.waitForFunction(
    () => !!(window as unknown as { __leafletMap?: unknown }).__leafletMap,
  );
}

// Click the map at the given coordinate and return the exact lat/lng Leaflet resolved for it
export async function clickMapAt(
  page: Page,
  targetCoordinates: LatLng,
): Promise<LatLng> {
  const { pixelPosition, resolvedCoordinates } = await page.evaluate(
    (coordinates) => {
      const mapInstance = (window as unknown as { __leafletMap: MapBridge })
        .__leafletMap;
      const containerPoint = mapInstance.latLngToContainerPoint([
        coordinates.lat,
        coordinates.lng,
      ]);

      const roundedPixelPosition = {
        x: Math.round(containerPoint.x),
        y: Math.round(containerPoint.y),
      };

      const exactLatLng = mapInstance.containerPointToLatLng([
        roundedPixelPosition.x,
        roundedPixelPosition.y,
      ]);

      return {
        pixelPosition: roundedPixelPosition,
        resolvedCoordinates: { lat: exactLatLng.lat, lng: exactLatLng.lng },
      };
    },
    targetCoordinates,
  );

  await page.locator(".leaflet-container").click({ position: pixelPosition });
  return resolvedCoordinates;
}

// Recenter/zoom the map instantly (no animation) so a known coordinate's pin is on screen
export function setView(
  page: Page,
  targetCoordinates: LatLng,
  zoomLevel: number,
) {
  return page.evaluate(
    ({ coordinates, zoom }) => {
      const mapInstance = (window as unknown as { __leafletMap: MapBridge })
        .__leafletMap;
      mapInstance.setView([coordinates.lat, coordinates.lng], zoom, {
        animate: false,
      });
    },
    { coordinates: targetCoordinates, zoom: zoomLevel },
  );
}
