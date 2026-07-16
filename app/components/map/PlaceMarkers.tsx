"use client";

// City / town markers. Rendered as 🏙️ icon pins (same visual system as the POI pins), each
// with its name always shown, clickable to open the city drawer. Revealed progressively by
// zoom: major cities show when zoomed out, smaller towns appear as you zoom in (see
// CITY_MIN_ZOOM / each city's `importance`). Mountains and other POIs are drawn by PoiMarkers.

import { useState } from "react";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { CITIES, CITY_MIN_ZOOM, POI_TYPES } from "@/data/croatiaData";

// One divIcon per selected/not state — reused across all city markers.
const cityIconCache = new Map<string, L.DivIcon>();
function cityIcon(selected: boolean): L.DivIcon {
  const key = String(selected);
  let icon = cityIconCache.get(key);
  if (!icon) {
    const { icon: emoji, color } = POI_TYPES.city;
    icon = L.divIcon({
      className: "cx-poi-icon",
      html: `<span class="cx-poi-pin${selected ? " cx-poi-pin--sel" : ""}" style="--poi:${color}">${emoji}</span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
    cityIconCache.set(key, icon);
  }
  return icon;
}

interface PlaceMarkersProps {
  onCityClick: (cityId: string) => void;
  selectedCity: string | null;
}

export default function PlaceMarkers({ onCityClick, selectedCity }: PlaceMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const visibleCities = CITIES.filter((c) => zoom >= CITY_MIN_ZOOM[c.importance]);

  return (
    <>
      {visibleCities.map((c) => {
        const isSelected = selectedCity === c.id;
        return (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={cityIcon(isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{ click: () => onCityClick(c.id) }}
          >
            <Tooltip permanent direction="right" offset={[14, 0]} className="cx-place-label">
              {c.name}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
