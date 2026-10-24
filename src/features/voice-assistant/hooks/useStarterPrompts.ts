"use client";

import { useMemo } from "react";
import { computeCountyPercents, useMapData, useTravelData } from "@/features/map-explorer";
import { buildStarterPrompts } from "@/features/voice-assistant/utils/starterPrompts";

// The panel's suggested questions, recomputed as the user's progress changes
export function useStarterPrompts(): string[] {
  const { counties, getVisitedPercent } = useMapData();
  const { poiDataMap, countyDataMap } = useTravelData(); // same React Query cache as the map

  return useMemo(() => {
    const countyPercents = computeCountyPercents(
      counties,
      poiDataMap,
      countyDataMap,
      getVisitedPercent,
    );
    const wishlistCount = Object.values(poiDataMap).filter(
      (record) => record?.status === "want_to_visit",
    ).length;
    return buildStarterPrompts(countyPercents, wishlistCount);
  }, [counties, poiDataMap, countyDataMap, getVisitedPercent]);
}
