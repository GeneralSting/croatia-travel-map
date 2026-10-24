import { useContext } from "react";
import { useStore } from "zustand";
import { MapControlContext } from "@/features/map-explorer/components/MapControlProvider";
import type {
  MapControlStore,
  MapControlStoreApi,
} from "@/features/map-explorer/store/mapControlStore";

// The store instance itself - for imperative calls (`getState().showPoi(...)`) outside render
export function useMapControlApi(): MapControlStoreApi {
  const store = useContext(MapControlContext);
  if (!store) {
    throw new Error("useMapControl must be used within a MapControlProvider");
  }
  return store;
}

/**
 * Subscribe to one slice of the map-control state; the component re-renders only when that slice
 * changes. Select single values or actions - a selector that builds a new object/array on every call
 * would re-render each time (wrap such selectors in zustand's useShallow)
 */
export function useMapControl<T>(selector: (state: MapControlStore) => T): T {
  return useStore(useMapControlApi(), selector);
}
