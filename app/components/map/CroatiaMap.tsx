"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import {
  COUNTIES,
  getCity,
  getPoi,
  getMountainPoi,
  getVisitedPercent,
  type POI,
  type PoiType,
} from "@/data/croatiaData";
import { useTravelData } from "@/lib/useTravelData";
import MapShapes from "@/components/map/MapShapes";
import PlaceMarkers from "@/components/map/PlaceMarkers";
import PoiMarkers from "@/components/map/PoiMarkers";
import MapClickHandler from "@/components/map/MapClickHandler";
import CroatiaLoading from "@/components/map/CroatiaLoading";
import UserMenu from "@/components/auth/UserMenu";
import MapLegend from "@/components/map/MapLegend";
import GlobalStats from "@/components/map/GlobalStats";
import CountyPanel from "@/components/panel/CountyPanel";
import CityPanel from "@/components/panel/CityPanel";
import PoiPanel from "@/components/panel/PoiPanel";
import SummaryDrawer from "@/components/panel/SummaryDrawer";
import { Compass, MapPin, X } from "lucide-react";

const MAP_CENTER: LatLngExpression = [45.1, 16.45];

// The right-hand panel is a small navigation stack: a county view can drill into one of its
// cities (with a back arrow), a city marker opens the city view directly, and a POI pin opens
// that place's detail.
type PanelView =
  | { kind: "county"; countyId: string }
  | { kind: "city"; cityId: string; countyId: string }
  | { kind: "poi"; poiId: string; countyId: string };

// While the user is adding a place, we hold the form values and wait for a map click to
// supply the coordinates.
interface Placing {
  countyId: string;
  name: string;
  type: PoiType;
  description?: string;
}

export default function CroatiaMap() {
  const {
    poiDataMap,
    countyDataMap,
    userPois,
    loaded,
    updatePOI,
    setCountyOverride,
    addUserPoi,
    deleteUserPoi,
  } = useTravelData();
  const [view, setView] = useState<PanelView | null>(null);
  const [placing, setPlacing] = useState<Placing | null>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [islands, setIslands] = useState<FeatureCollection | null>(null);

  // Load the county boundaries + islands once from our local static assets.
  useEffect(() => {
    fetch("/geo/croatia-counties.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => setGeoJson(data))
      .catch((e) => console.error("Failed to load Croatia GeoJSON", e));
    fetch("/geo/croatia-islands.geojson")
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
    setView((prev) =>
      prev?.kind === "county" && prev.countyId === countyId
        ? null
        : { kind: "county", countyId },
    );
  }, []);

  const handleCityClick = useCallback((cityId: string) => {
    const city = getCity(cityId);
    if (!city) return;
    setView({ kind: "city", cityId, countyId: city.county_id });
  }, []);

  const handleCityBack = useCallback(() => {
    setView((prev) =>
      prev ? { kind: "county", countyId: prev.countyId } : null,
    );
  }, []);

  const closePanel = useCallback(() => setView(null), []);

  // Clicking a pin opens that POI's detail. The county comes from the seed POI, or from the
  // user's own POI record.
  const handlePoiClick = useCallback(
    (poiId: string) => {
      const seed = getPoi(poiId) ?? getMountainPoi(poiId);
      const countyId =
        seed?.county_id ?? userPois.find((p) => p.id === poiId)?.county_id;
      if (!countyId) return;
      setView({ kind: "poi", poiId, countyId });
    },
    [userPois],
  );

  // Kick off "add a place": stash the form values and wait for a map click. Close any open
  // panel so the whole map is clickable (important on mobile, where the panel is full-width).
  const handleStartAddPlace = useCallback(
    (countyId: string, name: string, type: PoiType, description?: string) => {
      setView(null);
      setPlacing({ countyId, name, type, description });
    },
    [],
  );

  const handlePlacePick = useCallback(
    (lat: number, lng: number) => {
      if (!placing) return;
      const created = addUserPoi({
        county_id: placing.countyId,
        name: placing.name,
        type: placing.type,
        description: placing.description,
        lat,
        lng,
      });
      setPlacing(null);
      if (created) setView({ kind: "poi", poiId: created.id, countyId: placing.countyId });
    },
    [placing, addUserPoi],
  );

  // Esc cancels placement mode.
  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlacing(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placing]);

  // The POI currently shown in the panel (seed POI, or the user's own place mapped to POI shape).
  const activePoi: POI | null = useMemo(() => {
    if (view?.kind !== "poi") return null;
    const seed = getPoi(view.poiId) ?? getMountainPoi(view.poiId);
    if (seed) return seed;
    const u = userPois.find((p) => p.id === view.poiId);
    return u ? { ...u, description: u.description ?? "" } : null;
  }, [view, userPois]);
  const activePoiIsUser =
    view?.kind === "poi" && !getPoi(view.poiId) && !getMountainPoi(view.poiId);

  // A city keeps its parent county highlighted on the map; a bare county highlights itself.
  const selectedCounty = view ? view.countyId : null;
  const selectedCity = view?.kind === "city" ? view.cityId : null;
  const selectedPoi = view?.kind === "poi" ? view.poiId : null;

  if (!loaded || !geoJson) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)" }}
      >
        <CroatiaLoading />
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

        {/* Right side: stats live in the top bar (never float over the map), plus the user menu. */}
        <div className="flex items-center gap-4">
          <GlobalStats poiDataMap={poiDataMap} />
          <UserMenu />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative transition-all duration-300">
          <MapContainer
            center={MAP_CENTER}
            zoom={7}
            minZoom={7}
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
            <PlaceMarkers
              onCityClick={handleCityClick}
              selectedCity={selectedCity}
            />
            <PoiMarkers
              userPois={userPois}
              onPoiClick={handlePoiClick}
              selectedPoi={selectedPoi}
            />
            <MapClickHandler active={!!placing} onPick={handlePlacePick} />
          </MapContainer>

          {/* Placement banner while adding a place */}
          {placing && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-3 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-medium shadow-lg">
              <MapPin className="w-4 h-4" />
              <span className="max-w-[60vw] truncate">
                Click the map to place “{placing.name}”
              </span>
              <button
                onClick={() => setPlacing(null)}
                className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                title="Cancel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Legend */}
          <MapLegend />

          {/* Summary drawer */}
          <SummaryDrawer
            poiDataMap={poiDataMap}
            countyPercents={countyPercents}
            onCountySelect={handleCountyClick}
          />
        </div>

        {/* Right-hand panel: county overview, a drilled-in city view, or a single POI's detail */}
        {view && (
          <div className="w-full sm:w-96 flex-shrink-0 h-full overflow-hidden shadow-2xl animate-slide-in">
            {view.kind === "county" && (
              <CountyPanel
                countyId={view.countyId}
                poiDataMap={poiDataMap}
                countyDataMap={countyDataMap}
                userPois={userPois}
                onClose={closePanel}
                onCitySelect={handleCityClick}
                onPoiSelect={handlePoiClick}
                onPOIUpdate={updatePOI}
                onCountyOverride={setCountyOverride}
                onAddPlace={handleStartAddPlace}
              />
            )}
            {view.kind === "city" && (
              <CityPanel
                cityId={view.cityId}
                poiDataMap={poiDataMap}
                onClose={closePanel}
                onBack={handleCityBack}
                onPOIUpdate={updatePOI}
              />
            )}
            {view.kind === "poi" && activePoi && (
              <PoiPanel
                poi={activePoi}
                userData={poiDataMap[activePoi.id]}
                onUpdate={updatePOI}
                onClose={closePanel}
                onDelete={
                  activePoiIsUser
                    ? () => {
                        deleteUserPoi(activePoi.id);
                        closePanel();
                      }
                    : undefined
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
