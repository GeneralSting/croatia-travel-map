"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

/**
 * Loads the static Croatia GeoJSON assets once: county polygons + islands (drawn on the map) and
 * the detailed national outline (used to validate where a user may drop a custom place).
 */
export function useCroatiaGeoJson() {
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [islands, setIslands] = useState<FeatureCollection | null>(null);
  const [outline, setOutline] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/geo/croatia-counties.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setGeoJson(data))
      .catch((e) => console.error("Failed to load Croatia GeoJSON", e));
    fetch("/geo/croatia-islands.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setIslands(data))
      .catch((e) => console.error("Failed to load Croatia islands GeoJSON", e));
    fetch("/geo/croatia-outline.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setOutline(data))
      .catch((e) => console.error("Failed to load Croatia outline GeoJSON", e));
  }, []);

  return { geoJson, islands, outline };
}
