"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { FeatureCollection } from "geojson";
import { isNearCroatia, findCountyId } from "@/features/map-explorer/utils/geo";
import type {
  County,
  NewUserPoi,
  Placing,
  POI,
  PoiType,
} from "@/features/map-explorer/types/types";

interface UsePlacementArgs {
  placingRef: RefObject<boolean>; // shared guard the map's click handlers read to ignore navigation clicks while placing
  geoJson: FeatureCollection | null;
  islands: FeatureCollection | null;
  outline: FeatureCollection | null;
  counties: County[];
  addCustomPoi: (input: NewUserPoi) => POI | null;
  closePanel: () => void; // close any open panel when entering placement mode - the whole map must be clickable
  onPlaced: (poiId: string, countyId: string) => void; // open the newly-created POI's detail panel
}

/**
 * "Add a place" is two step flow:
 *  - user picks a spot on the map
 *  - popup form appears at that spot and collects the name and type
 * the county is inferred from the coordinates
 */
export function usePlacement({
  placingRef,
  geoJson,
  islands,
  outline,
  counties,
  addCustomPoi,
  closePanel,
  onPlaced,
}: UsePlacementArgs) {
  const [placing, setPlacing] = useState<Placing | null>(null);
  const [placeError, setPlaceError] = useState(false);

  const startPlacing = useCallback(() => {
    closePanel();
    setPlaceError(false);
    setPlacing({ status: "picking" });
  }, [closePanel]);

  const cancelPlacing = useCallback(() => {
    setPlacing(null);
    setPlaceError(false);
  }, []);

  /**
   * first step: the user clicks a spot - keep pins on (or within 1 km of) Croatian land
   * Reject clicks out in the sea/abroad - then open the form bubble at that spot
   */
  const handlePlacePick = useCallback(
    (lat: number, lng: number) => {
      if (!isNearCroatia(lat, lng, outline)) {
        setPlaceError(true);
        return;
      }
      setPlaceError(false);
      setPlacing({ status: "form", lat, lng });
    },
    [outline],
  );

  // Second step: the form is confirmed - infer the county from the coordinates and create the place
  const handleConfirmPlace = useCallback(
    (name: string, type: PoiType) => {
      if (placing?.status !== "form") return;
      const { lat, lng } = placing;
      const countyId =
        findCountyId(lat, lng, geoJson, islands) ?? counties[0]?.id;
      if (!countyId) return;
      const created = addCustomPoi({
        county_id: countyId,
        name,
        type,
        lat,
        lng,
      });
      setPlacing(null);
      setPlaceError(false);
      if (created) onPlaced(created.id, countyId);
    },
    [placing, geoJson, islands, counties, addCustomPoi, onPlaced],
  );

  /**
   * keep the guard ref in sync AFTER render (not during it) so the map's click handlers read the latest state
   * without being re-created on every placement change (which would rebind markers)
   */
  useEffect(() => {
    placingRef.current = placing !== null;
  }, [placing, placingRef]);

  // Esc cancels placement mode.
  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelPlacing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placing, cancelPlacing]);

  return {
    placing,
    placeError,
    startPlacing,
    cancelPlacing,
    handlePlacePick,
    handleConfirmPlace,
  };
}
