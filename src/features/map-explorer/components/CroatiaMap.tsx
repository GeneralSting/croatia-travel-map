"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { isNearCroatia, findCountyId } from "@/features/map-explorer/utils/geo";
import MapShapes from "@/features/map-explorer/components/MapShapes";
import PlaceMarkers from "@/features/map-explorer/components/PlaceMarkers";
import PoiMarkers from "@/features/map-explorer/components/PoiMarkers";
import MapClickHandler from "@/features/map-explorer/components/MapClickHandler";
import AddPlaceForm from "@/features/map-explorer/components/AddPlaceForm";
import AddPlaceButton from "@/features/map-explorer/components/AddPlaceButton";
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

// "Add a place" is a two-step flow that no longer depends on a county: first the user picks a
// spot on the map (picking), then a popup form at that spot collects the name + type (form).
// The county is inferred from the coordinates on confirm.
type Placing =
  | { status: "picking" }
  | { status: "form"; lat: number; lng: number };

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
  // A county/island click bubbles to the map click, so while placing a pin we must ignore
  // navigation clicks — otherwise the clicked county's panel would open behind the form. A ref
  // keeps the click handlers' identity stable (no marker/shape rebinds on every placement).
  const placingRef = useRef(false);
  placingRef.current = placing !== null;
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
    if (placingRef.current) return; // dropping a pin — don't open the county
    setView((prev) =>
      prev?.kind === "county" && prev.countyId === countyId
        ? null
        : { kind: "county", countyId },
    );
  }, []);

  const handleCityClick = useCallback((cityId: string) => {
    if (placingRef.current) return;
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
      if (placingRef.current) return;
      const seed = getPoi(poiId) ?? getMountainPoi(poiId);
      const countyId =
        seed?.county_id ?? userPois.find((p) => p.id === poiId)?.county_id;
      if (!countyId) return;
      setView({ kind: "poi", poiId, countyId });
    },
    [userPois],
  );

  // Enter placement mode. Close any open panel so the whole map is clickable (important on
  // mobile, where the panel is full-width).
  const startPlacing = useCallback(() => {
    setView(null);
    setPlaceError(false);
    setPlacing({ status: "picking" });
  }, []);

  const cancelPlacing = useCallback(() => {
    setPlacing(null);
    setPlaceError(false);
  }, []);

  // First step: the user clicks a spot. Keep pins on (or within 1 km of) Croatian land — reject
  // clicks out in the sea / abroad — then open the form bubble at that spot.
  const handlePlacePick = useCallback(
    (lat: number, lng: number) => {
      if (!isNearCroatia(lat, lng, outline)) {
        setPlaceError(true);
        return;
      }
      setPlaceError(false);
      setPlacing({ status: "form", lat, lng });
    },
    [outline],
  );

  // Second step: the form is confirmed. Infer the county from the coordinates (no county is
  // chosen up front any more) and create the place.
  const handleConfirmPlace = useCallback(
    (name: string, type: PoiType) => {
      if (placing?.status !== "form") return;
      const { lat, lng } = placing;
      const countyId =
        findCountyId(lat, lng, geoJson, islands) ?? COUNTIES[0].id;
      const created = addUserPoi({ county_id: countyId, name, type, lat, lng });
      setPlacing(null);
      setPlaceError(false);
      if (created) setView({ kind: "poi", poiId: created.id, countyId });
    },
    [placing, geoJson, islands, addUserPoi],
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

  // A city keeps its parent county highlighted; a bare county highlights itself.
  const selectedCounty = view?.countyId ?? null;
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
            {/* Top-left: the add-place + account/filters cluster now lives on the right. */}
            <ZoomControl position="topleft" />
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
            <MapClickHandler
              active={placing?.status === "picking"}
              onPick={handlePlacePick}
            />
            {placing?.status === "form" && (
              <AddPlaceForm
                lat={placing.lat}
                lng={placing.lng}
                onConfirm={handleConfirmPlace}
                onCancel={cancelPlacing}
              />
            )}
          </MapContainer>

          {/* Placement pill while picking a spot — kept mounted so it can fade + slide out. */}
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 z-1000 transition-all duration-300 ease-out ${
              placing?.status === "picking"
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-full text-white text-xs font-medium shadow-lg transition-colors duration-200 ${
                placeError ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="max-w-[70vw] truncate">
                {placeError
                  ? "That spot is outside Croatia — click on the map"
                  : "Click the map to drop your pin"}
              </span>
              <button
                onClick={cancelPlacing}
                className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                title="Cancel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Top-right cluster: add-place button, then the account + display-filters accordion */}
          <div className="absolute top-4 right-4 z-1000 flex items-start gap-2">
            <AddPlaceButton
              active={!!placing}
              onToggle={() => (placing ? cancelPlacing() : startPlacing())}
            />
            <MapControls
              showNames={showPoiNames}
              onToggleNames={() => setShowPoiNames((v) => !v)}
              enabledTypes={enabledTypes}
              onToggleType={toggleType}
            />
          </div>

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
