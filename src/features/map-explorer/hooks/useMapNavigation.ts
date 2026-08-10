"use client";

import { useCallback, useMemo, useState, type RefObject } from "react";
import type { City, PanelView, POI } from "@/features/map-explorer/types/types";

interface UseMapNavigationArgs {
  getCity: (cityId: string) => City | undefined;
  getPoi: (poiId: string) => POI | undefined;
  placingRef: RefObject<boolean>; // true while the user is dropping a pin - navigation clicks are ignored so no panel opens
}

/**
 * the tight-hand panel is a small navigation stack: a county view can drill into one of its cities
 * (with a back arrow), a city marker opens the city view directly, and a POI pin opens its detail
 */
export function useMapNavigation({
  getCity,
  getPoi,
  placingRef,
}: UseMapNavigationArgs) {
  const [view, setView] = useState<PanelView | null>(null);

  const openCounty = useCallback(
    (countyId: string) => {
      if (placingRef.current) return; // dropping a pin — don't open the county
      setView((prev) =>
        prev?.kind === "county" && prev.countyId === countyId
          ? null
          : { kind: "county", countyId },
      );
    },
    [placingRef],
  );

  const openCity = useCallback(
    (cityId: string) => {
      if (placingRef.current) return;
      const city = getCity(cityId);
      if (!city) return;
      setView({ kind: "city", cityId, countyId: city.county_id });
    },
    [getCity, placingRef],
  );

  const goBackToCounty = useCallback(() => {
    setView((prev) =>
      prev ? { kind: "county", countyId: prev.countyId } : null,
    );
  }, []);

  // Clicking a pin opens that POI's detail; the county comes from the POI row (default or custom)
  const openPoi = useCallback(
    (poiId: string) => {
      if (placingRef.current) return;
      const poi = getPoi(poiId);
      if (!poi) return;
      setView({ kind: "poi", poiId, countyId: poi.county_id });
    },
    [getPoi, placingRef],
  );

  // Open a POI panel directly (used right after creating a custom place — no click guard needed)
  const openPoiPanel = useCallback((poiId: string, countyId: string) => {
    setView({ kind: "poi", poiId, countyId });
  }, []);

  const closePanel = useCallback(() => setView(null), []);

  // The POI currently shown in the panel (any POI — default or the user's own)
  const activePoi = useMemo(
    () => (view?.kind === "poi" ? (getPoi(view.poiId) ?? null) : null),
    [view, getPoi],
  );

  return {
    view,
    activePoi,
    activePoiIsUser: activePoi?.owner_id != null,
    selectedCounty: view?.countyId ?? null, // city keeps its parent county highlighted, a bare county highlights itself
    selectedCity: view?.kind === "city" ? view.cityId : null,
    selectedPoi: view?.kind === "poi" ? view.poiId : null,
    openCounty,
    openCity,
    goBackToCounty,
    openPoi,
    openPoiPanel,
    closePanel,
  };
}
