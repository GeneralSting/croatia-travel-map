"use client";

import { useMemo } from "react";
import type { PoiType } from "@/features/map-explorer/types/types";
import { useMapControl } from "@/features/map-explorer/hooks/useMapControl";

/**
 * Map display + filter state. Types default to enabled (a type is off only while in `hiddenTypes`),
 * so the filter doesn't need the full type list at mount. "My places" toggles the user's custom
 * POIs independently of the type filters. The state lives in the map-control store, so code outside
 * the toolbar (e.g. voice tools) can change the same filters
 */
export function useMapFilters(poiTypeOrder: PoiType[]) {
  const showPoiNames = useMapControl((state) => state.showPoiNames);
  const hiddenTypes = useMapControl((state) => state.hiddenTypes);
  const showCustom = useMapControl((state) => state.showCustom);
  const toggleNames = useMapControl((state) => state.toggleNames);
  const toggleType = useMapControl((state) => state.toggleType);
  const toggleCustom = useMapControl((state) => state.toggleCustom);

  const enabledTypes = useMemo(
    () =>
      Object.fromEntries(
        poiTypeOrder.map((type) => [type, !hiddenTypes.has(type)]),
      ) as Record<PoiType, boolean>,
    [poiTypeOrder, hiddenTypes],
  );

  return {
    showPoiNames,
    toggleNames,
    enabledTypes,
    toggleType,
    showCustom,
    toggleCustom,
  };
}
