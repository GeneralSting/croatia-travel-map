"use client";

import { useCallback, useMemo, useState } from "react";
import type { PoiType } from "@/features/map-explorer/types/types";

/**
 * Map display + filter state. Types default to enabled (a type is off only while in `hiddenTypes`),
 * so the filter doesn't need the full type list at mount. "My places" toggles the user's custom
 * POIs independently of the type filters.
 */
export function useMapFilters(poiTypeOrder: PoiType[]) {
  const [showPoiNames, setShowPoiNames] = useState(true);
  const [hiddenTypes, setHiddenTypes] = useState<Set<PoiType>>(new Set());
  const [showCustom, setShowCustom] = useState(true);

  const enabledTypes = useMemo(
    () =>
      Object.fromEntries(
        poiTypeOrder.map((type) => [type, !hiddenTypes.has(type)]),
      ) as Record<PoiType, boolean>,
    [poiTypeOrder, hiddenTypes],
  );

  const toggleType = useCallback((type: PoiType) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const toggleNames = useCallback(() => setShowPoiNames((value) => !value), []);
  const toggleCustom = useCallback(() => setShowCustom((value) => !value), []);

  return {
    showPoiNames,
    toggleNames,
    enabledTypes,
    toggleType,
    showCustom,
    toggleCustom,
  };
}
