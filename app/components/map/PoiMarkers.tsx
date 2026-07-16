"use client";

// Points of interest drawn on the map: the seed POIs that have coordinates (from poiCoords.ts)
// plus the signed-in user's own added places. Each shows its type emoji in a coloured pin, is
// revealed by zoom (so a zoomed-out map stays clean), and opens that POI's detail on click.

import { useMemo, useState } from "react";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  POI_TYPES,
  mappablePois,
  mountainPois,
  type PoiType,
  type UserPoi,
} from "@/data/croatiaData";

// Zoom at which each type's pins appear. Mountains show early (they're sparse landmarks);
// campsites are dense, so they come in a touch later.
const TYPE_MIN_ZOOM: Partial<Record<PoiType, number>> = { mountain: 8, campsite: 10 };
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
    const { icon: emoji, color } = POI_TYPES[type];
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
}

interface PoiMarkersProps {
  userPois: UserPoi[];
  onPoiClick: (poiId: string) => void;
  selectedPoi: string | null;
}

export default function PoiMarkers({ userPois, onPoiClick, selectedPoi }: PoiMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const markers = useMemo<MarkerDatum[]>(() => {
    const seed = [...mappablePois(), ...mountainPois()].map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      lat: p.lat as number,
      lng: p.lng as number,
    }));
    const user = userPois.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      lat: p.lat,
      lng: p.lng,
    }));
    return [...seed, ...user];
  }, [userPois]);

  const visible = markers.filter((m) => zoom >= minZoomFor(m.type));

  return (
    <>
      {visible.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={poiIcon(m.type, selectedPoi === m.id)}
          zIndexOffset={selectedPoi === m.id ? 1000 : 0}
          eventHandlers={{ click: () => onPoiClick(m.id) }}
        >
          <Tooltip permanent direction="right" offset={[14, 0]} className="cx-place-label">
            {m.name}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
