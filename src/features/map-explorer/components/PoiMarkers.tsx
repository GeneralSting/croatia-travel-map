"use client";

// Points of interest drawn on the map: the shared default POIs that have coordinates plus the
// signed-in user's own added places (both come from the unified `pois` table via useMapData). Each
// shows its type emoji in a coloured pin, is revealed by zoom, and opens that POI's detail on click.

import { useMemo, useState } from "react";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useMapData } from "@/features/map-explorer/hooks/useMapData";
import { POI_TYPE_STYLE } from "@/features/map-explorer/constants/poiTypeStyle";
import { isCustomPoi, type PoiType } from "@/features/map-explorer/types/types";

// Zoom at which each type's pins appear. Mountains show early (they're sparse landmarks);
// campsites are dense, so they come in a touch later.
const TYPE_MIN_ZOOM: Partial<Record<PoiType, number>> = {
  mountain: 8,
  campsite: 10,
};
const POI_MIN_ZOOM = 9;

function minZoomFor(type: PoiType): number {
  return TYPE_MIN_ZOOM[type] ?? POI_MIN_ZOOM;
}

// One divIcon per (type, selected) combination — cheap to cache and reuse across markers.
const iconCache = new Map<string, L.DivIcon>();
function poiIcon(type: PoiType, selected: boolean): L.DivIcon {
  const key = `${type}:${selected}`;
  let icon = iconCache.get(key);
  if (!icon) {
    const { icon: emoji, color } = POI_TYPE_STYLE[type];
    icon = L.divIcon({
      className: "cx-poi-icon",
      html: `<span class="cx-poi-pin${selected ? " cx-poi-pin--sel" : ""}" style="--poi:${color}">${emoji}</span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

interface MarkerDatum {
  id: string;
  name: string;
  type: PoiType;
  lat: number;
  lng: number;
  isCustom: boolean;
}

interface PoiMarkersProps {
  onPoiClick: (poiId: string) => void;
  selectedPoi: string | null;
  /** When true, every pin shows its name permanently; otherwise only on hover. */
  showNames: boolean;
  /** Which default POI types are currently shown. */
  enabledTypes: Record<PoiType, boolean>;
  /** When true, the user's custom POIs are shown regardless of their type filter. */
  showCustom: boolean;
}

export default function PoiMarkers({
  onPoiClick,
  selectedPoi,
  showNames,
  enabledTypes,
  showCustom,
}: PoiMarkersProps) {
  const { mappablePois } = useMapData();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const markers = useMemo<MarkerDatum[]>(
    () =>
      mappablePois().map((poi) => ({
        id: poi.id,
        name: poi.name,
        type: poi.type,
        lat: poi.lat as number,
        lng: poi.lng as number,
        isCustom: isCustomPoi(poi),
      })),
    [mappablePois],
  );

  // Custom POIs follow the "My places" toggle; defaults follow their type toggle. Zoom reveal
  // applies to both so a zoomed-out map stays clean.
  const visible = markers.filter((marker) => {
    const originVisible = marker.isCustom
      ? showCustom
      : enabledTypes[marker.type];
    return originVisible && zoom >= minZoomFor(marker.type);
  });

  return (
    <>
      {visible.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={poiIcon(marker.type, selectedPoi === marker.id)}
          zIndexOffset={selectedPoi === marker.id ? 1000 : 0}
          eventHandlers={{ click: () => onPoiClick(marker.id) }}
        >
          {/* key forces Leaflet to rebind when the permanent/hover mode changes */}
          <Tooltip
            key={showNames ? "perm" : "hover"}
            permanent={showNames}
            direction="right"
            offset={[14, 0]}
            className="cx-place-label"
          >
            {marker.name}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
