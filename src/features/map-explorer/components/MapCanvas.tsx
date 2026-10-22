"use client";

// The Leaflet map itself: the county/island shapes, city + POI markers, and the in-map placement
// click handler / add-place form. Everything that lives *inside* <MapContainer> lives here, so the
// orchestrator (CroatiaMap) only has to wire props, not the whole layer stack.

import { useEffect } from "react";
import { MapContainer, ZoomControl, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import type { Placing, PoiType } from "@/features/map-explorer/types/types";
import MapShapes from "@/features/map-explorer/components/MapShapes";
import PlaceMarkers from "@/features/map-explorer/components/PlaceMarkers";
import PoiMarkers from "@/features/map-explorer/components/PoiMarkers";
import MapClickHandler from "@/features/map-explorer/components/MapClickHandler";
import AddPlaceForm from "@/features/map-explorer/components/AddPlaceForm";
import MapCameraController from "@/features/map-explorer/components/MapCameraController";

const MAP_CENTER: LatLngExpression = [45.1, 16.45];

// Dev/e2e ONLY (stripped from production builds by the guard at its call site): exposes the Leaflet
// map instance on window so end-to-end tests can convert a known coordinate to a pixel and drive
// the map deterministically — instead of guessing which pixel lands on Croatian soil.
function MapTestBridge() {
  const map = useMap();
  useEffect(() => {
    (window as unknown as { __leafletMap?: unknown }).__leafletMap = map;
    return () => {
      delete (window as unknown as { __leafletMap?: unknown }).__leafletMap;
    };
  }, [map]);
  return null;
}

interface MapCanvasProps {
  geoJson: FeatureCollection;
  islands: FeatureCollection | null;
  countyPercents: Record<string, number>;
  showNames: boolean;
  enabledTypes: Record<PoiType, boolean>;
  showCustom: boolean;
  selectedCounty: string | null;
  selectedCity: string | null;
  selectedPoi: string | null;
  placing: Placing | null;
  onCountyClick: (countyId: string) => void;
  onCityClick: (cityId: string) => void;
  onPoiClick: (poiId: string) => void;
  onPlacePick: (lat: number, lng: number) => void;
  onConfirmPlace: (name: string, type: PoiType) => void;
  onCancelPlace: () => void;
}

export default function MapCanvas({
  geoJson,
  islands,
  countyPercents,
  showNames,
  enabledTypes,
  showCustom,
  selectedCounty,
  selectedCity,
  selectedPoi,
  placing,
  onCountyClick,
  onCityClick,
  onPoiClick,
  onPlacePick,
  onConfirmPlace,
  onCancelPlace,
}: MapCanvasProps) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={7}
      minZoom={7}
      maxZoom={12}
      style={{ height: "100%", width: "100%", background: "#0C1A2E" }}
      zoomControl={false}
      attributionControl={false}
    >
      <ZoomControl position="topleft" />
      {process.env.NODE_ENV !== "production" && <MapTestBridge />}
      <MapCameraController counties={geoJson} islands={islands} />
      <MapShapes
        counties={geoJson}
        islands={islands}
        countyPercents={countyPercents}
        onCountyClick={onCountyClick}
        selectedCounty={selectedCounty}
      />
      <PlaceMarkers
        onCityClick={onCityClick}
        selectedCity={selectedCity}
        show={enabledTypes.city ?? true}
        showNames={showNames}
      />
      <PoiMarkers
        onPoiClick={onPoiClick}
        selectedPoi={selectedPoi}
        showNames={showNames}
        enabledTypes={enabledTypes}
        showCustom={showCustom}
      />
      <MapClickHandler
        active={placing?.status === "picking"}
        onPick={onPlacePick}
      />
      {placing?.status === "form" && (
        <AddPlaceForm
          lat={placing.lat}
          lng={placing.lng}
          onConfirm={onConfirmPlace}
          onCancel={onCancelPlace}
        />
      )}
    </MapContainer>
  );
}
