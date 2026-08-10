"use client";

// The Leaflet map itself: the county/island shapes, city + POI markers, and the in-map placement
// click handler / add-place form. Everything that lives *inside* <MapContainer> lives here, so the
// orchestrator (CroatiaMap) only has to wire props, not the whole layer stack.

import { MapContainer, ZoomControl } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import type { Placing, PoiType } from "@/features/map-explorer/types/types";
import MapShapes from "@/features/map-explorer/components/MapShapes";
import PlaceMarkers from "@/features/map-explorer/components/PlaceMarkers";
import PoiMarkers from "@/features/map-explorer/components/PoiMarkers";
import MapClickHandler from "@/features/map-explorer/components/MapClickHandler";
import AddPlaceForm from "@/features/map-explorer/components/AddPlaceForm";

const MAP_CENTER: LatLngExpression = [45.1, 16.45];

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
