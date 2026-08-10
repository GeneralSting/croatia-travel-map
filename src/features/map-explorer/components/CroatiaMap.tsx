"use client";

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MapDataProvider } from "@/features/map-explorer/components/MapDataProvider";
import { MapNotConfigured } from "./MapNotConfigured";
import { CroatiaMapView } from "./CroatiaMapView";

// Reference data and custom POI CRUD come from the DB, so the whole tree lives under the provider
export default function CroatiaMap() {
  if (!isSupabaseConfigured) return <MapNotConfigured />;
  return (
    <MapDataProvider>
      <CroatiaMapView />
    </MapDataProvider>
  );
}
