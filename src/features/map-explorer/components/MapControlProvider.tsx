"use client";

import { createContext, useState, type ReactNode } from "react";
import {
  createMapControlStore,
  type MapControlStoreApi,
} from "@/features/map-explorer/store/mapControlStore";

/**
 * Holds one map-control store per mounted map. The context carries the store *instance* (which never
 * changes), not its state, so providing it re-renders nothing - components subscribe to the slices
 * they need through useMapControl(selector)
 */
export const MapControlContext = createContext<MapControlStoreApi | null>(null);

export function MapControlProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: the store is created exactly once for this provider's lifetime
  const [store] = useState(() => createMapControlStore());

  return (
    <MapControlContext.Provider value={store}>
      {children}
    </MapControlContext.Provider>
  );
}
