"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, ZoomControl } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import {
  COUNTIES,
  POI_TYPES,
  getCity,
  getPoi,
  getMountainPoi,
  getVisitedPercent,
  type POI,
  type PoiType,
} from "@/features/map-explorer/data";
import { useTravelData } from "@/features/map-explorer/hooks/useTravelData";
import { isNearCroatia } from "@/features/map-explorer/utils/geo";
import MapShapes from "@/features/map-explorer/components/MapShapes";
import PlaceMarkers from "@/features/map-explorer/components/PlaceMarkers";
import PoiMarkers from "@/features/map-explorer/components/PoiMarkers";
import MapClickHandler from "@/features/map-explorer/components/MapClickHandler";
import MapControls from "@/features/map-explorer/components/MapControls";
import CountyPanel from "@/features/map-explorer/components/panels/CountyPanel";
import CityPanel from "@/features/map-explorer/components/panels/CityPanel";
import PoiPanel from "@/features/map-explorer/components/panels/PoiPanel";
import SummaryDrawer from "@/features/map-explorer/components/panels/SummaryDrawer";
import { MapPin, X } from "lucide-react";
import CroatiaLoading from "./CroatiaLoading";

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
  const [placeError, setPlaceError] = useState(false);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [islands, setIslands] = useState<FeatureCollection | null>(null);
  const [outline, setOutline] = useState<FeatureCollection | null>(null);

  // Map display settings (owned here, controlled from MapLegend, consumed by the marker layers).
  const [showPoiNames, setShowPoiNames] = useState(true);
  const [enabledTypes, setEnabledTypes] = useState<Record<PoiType, boolean>>(
    () =>
      Object.fromEntries(
        (Object.keys(POI_TYPES) as PoiType[]).map((t) => [t, true]),
      ) as Record<PoiType, boolean>,
  );
  const toggleType = useCallback(
    (t: PoiType) => setEnabledTypes((prev) => ({ ...prev, [t]: !prev[t] })),
    [],
  );

  // Load the county boundaries + islands (for the map) and the detailed national outline (for
  // validating where a user can drop a place) once from our local static assets.
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
      setPlaceError(false);
      setPlacing({ countyId, name, type, description });
    },
    [],
  );

  const cancelPlacing = useCallback(() => {
    setPlacing(null);
    setPlaceError(false);
  }, []);

  const handlePlacePick = useCallback(
    (lat: number, lng: number) => {
      if (!placing) return;
      // Keep pins on (or within 1 km of) Croatian land — reject clicks out in the sea / abroad.
      if (!isNearCroatia(lat, lng, outline)) {
        setPlaceError(true);
        return;
      }
      const created = addUserPoi({
        county_id: placing.countyId,
        name: placing.name,
        type: placing.type,
        description: placing.description,
        lat,
        lng,
      });
      setPlacing(null);
      setPlaceError(false);
      if (created)
        setView({ kind: "poi", poiId: created.id, countyId: placing.countyId });
    },
    [placing, addUserPoi, outline],
  );

  // Esc cancels placement mode.
  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelPlacing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placing, cancelPlacing]);

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

  // A city keeps its parent county highlighted; a bare county highlights itself. While adding a
  // place, keep the target county highlighted so it's clear where the pin will belong.
  const selectedCounty = view?.countyId ?? placing?.countyId ?? null;
  const selectedCity = view?.kind === "city" ? view.cityId : null;
  const selectedPoi = view?.kind === "poi" ? view.poiId : null;

  if (!loaded || !geoJson) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)",
        }}
      >
        <CroatiaLoading />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 overflow-hidden">
      {/* Main content — the map fills the whole viewport; account/filters float over it. */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative transition-all duration-300">
          <MapContainer
            center={MAP_CENTER}
            zoom={7}
            minZoom={7}
            maxZoom={12}
            style={{ height: "100%", width: "100%", background: "#0C1A2E" }}
            zoomControl={false}
            attributionControl={false}
          >
            {/* Moved to the top-right so it doesn't sit under the account/filters accordion. */}
            <ZoomControl position="topright" />
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
              show={enabledTypes.city}
              showNames={showPoiNames}
            />
            <PoiMarkers
              userPois={userPois}
              onPoiClick={handlePoiClick}
              selectedPoi={selectedPoi}
              showNames={showPoiNames}
              enabledTypes={enabledTypes}
            />
            <MapClickHandler active={!!placing} onPick={handlePlacePick} />
          </MapContainer>

          {/* Placement banner while adding a place */}
          {placing && (
            <div
              className={`absolute top-3 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-3 px-4 py-2 rounded-full text-white text-xs font-medium shadow-lg ${
                placeError ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="max-w-[70vw] truncate">
                {placeError
                  ? "That spot is outside Croatia — click on the map"
                  : `Click the map to place “${placing.name}”`}
              </span>
              <button
                onClick={cancelPlacing}
                className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                title="Cancel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Account + display filters */}
          <MapControls
            showNames={showPoiNames}
            onToggleNames={() => setShowPoiNames((v) => !v)}
            enabledTypes={enabledTypes}
            onToggleType={toggleType}
          />

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
