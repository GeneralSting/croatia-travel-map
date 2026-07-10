"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import { COUNTIES, getVisitedPercent } from "@/data/croatiaData";
import { useTravelData } from "@/lib/useTravelData";
import MapShapes from "@/components/map/MapShapes";
import PlaceMarkers from "@/components/map/PlaceMarkers";
import MapLegend from "@/components/map/MapLegend";
import GlobalStats from "@/components/map/GlobalStats";
import CountyPanel from "@/components/panel/CountyPanel";
import SummaryDrawer from "@/components/panel/SummaryDrawer";
import { Compass } from "lucide-react";

const MAP_CENTER: LatLngExpression = [45.1, 16.45];

export default function CroatiaMap() {
  const { poiDataMap, countyDataMap, loaded, updatePOI, setCountyOverride } =
    useTravelData();
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [islands, setIslands] = useState<FeatureCollection | null>(null);

  // Load the county boundaries + islands once from our local static assets.
  useEffect(() => {
    fetch("/croatia-counties.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setGeoJson(data))
      .catch((e) => console.error("Failed to load Croatia GeoJSON", e));
    fetch("/croatia-islands.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setIslands(data))
      .catch((e) => console.error("Failed to load Croatia islands GeoJSON", e));
  }, []);

  // County visited percents (auto from POIs, or a manual override).
  const countyPercents = useMemo(() => {
    const result: Record<string, number> = {};
    COUNTIES.forEach((c) => {
      const record = countyDataMap[c.id];
      if (record?.is_manual_override && record?.visited_percent != null) {
        result[c.id] = record.visited_percent;
      } else {
        result[c.id] = getVisitedPercent(c.id, poiDataMap);
      }
    });
    return result;
  }, [poiDataMap, countyDataMap]);

  const handleCountyClick = useCallback((countyId: string) => {
    setSelectedCounty((prev) => (prev === countyId ? null : countyId));
  }, []);

  if (!loaded || !geoJson) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Compass
            className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin"
            style={{ animationDuration: "2s" }}
          />
          <p className="text-white/60 text-sm">Loading Croatia map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-slate-950/95 border-b border-white/10 z-[1001]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">
              Croatia Explorer
            </h1>
            <p className="text-[10px] text-white/40 leading-none mt-0.5">
              Interactive Travel Map
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative transition-all duration-300">
          <MapContainer
            center={MAP_CENTER}
            zoom={7}
            minZoom={6}
            maxZoom={12}
            style={{ height: "100%", width: "100%", background: "#0C1A2E" }}
            zoomControl={true}
            attributionControl={false}
          >
            <MapShapes
              counties={geoJson}
              islands={islands}
              countyPercents={countyPercents}
              onCountyClick={handleCountyClick}
              selectedCounty={selectedCounty}
            />
            <PlaceMarkers />
          </MapContainer>

          {/* Floating stats bar */}
          <GlobalStats poiDataMap={poiDataMap} />

          {/* Legend */}
          <MapLegend />

          {/* Summary drawer */}
          <SummaryDrawer
            poiDataMap={poiDataMap}
            countyPercents={countyPercents}
            onCountySelect={handleCountyClick}
          />
        </div>

        {/* County side panel */}
        {selectedCounty && (
          <div className="w-full sm:w-96 flex-shrink-0 h-full overflow-hidden shadow-2xl animate-slide-in">
            <CountyPanel
              countyId={selectedCounty}
              poiDataMap={poiDataMap}
              countyDataMap={countyDataMap}
              onClose={() => setSelectedCounty(null)}
              onPOIUpdate={updatePOI}
              onCountyOverride={setCountyOverride}
            />
          </div>
        )}
      </div>
    </div>
  );
}
