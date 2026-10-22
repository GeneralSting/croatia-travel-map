"use client";

import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MapDataProvider } from "@/features/map-explorer/components/MapDataProvider";
import { MapControlProvider } from "@/features/map-explorer/components/MapControlProvider";
import { MapNotConfigured } from "./MapNotConfigured";
import { CroatiaMapView } from "./CroatiaMapView";

/**
 * Reference data and custom POI CRUD come from the DB, so the whole tree lives under MapDataProvider
 * MapControlProvider holds the map-control store (panels, filters, highlights, camera)
 */
export default function CroatiaMap({ children }: { children?: ReactNode }) {
  if (!isSupabaseConfigured) return <MapNotConfigured />;
  return (
    <MapDataProvider>
      <MapControlProvider>
        <CroatiaMapView>{children}</CroatiaMapView>
      </MapControlProvider>
    </MapDataProvider>
  );
}
