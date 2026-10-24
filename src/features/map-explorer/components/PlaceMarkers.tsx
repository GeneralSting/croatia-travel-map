"use client";

// City / town markers. Rendered as 🏙️ icon pins (same visual system as the POI pins), each
// with its name always shown, clickable to open the city drawer. Revealed progressively by
// zoom: major cities show when zoomed out, smaller towns appear as you zoom in (see
// CITY_MIN_ZOOM / each city's `importance`). Mountains and other POIs are drawn by PoiMarkers.

import { useState } from "react";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useMapData } from "@/features/map-explorer/hooks/useMapData";
import { useMapControl } from "@/features/map-explorer/hooks/useMapControl";
import { CITY_MIN_ZOOM, POI_TYPE_STYLE } from "../constants/const";

// One divIcon per selected/highlighted state — reused across all city markers.
const cityIconCache = new Map<string, L.DivIcon>();
function cityIcon(selected: boolean, highlighted: boolean): L.DivIcon {
  const key = `${selected}:${highlighted}`;
  let icon = cityIconCache.get(key);
  if (!icon) {
    const { icon: emoji, color } = POI_TYPE_STYLE.city;
    const modifiers = `${selected ? " cx-poi-pin--sel" : ""}${highlighted ? " cx-poi-pin--hl" : ""}`;
    icon = L.divIcon({
      className: "cx-poi-icon",
      html: `<span class="cx-poi-pin${modifiers}" style="--poi:${color}">${emoji}</span>`,
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
  /** Towns are the "city" POI type — hidden when that filter is off. */
  show: boolean;
  /** When true, every town shows its name permanently; otherwise only on hover. */
  showNames: boolean;
}

export default function PlaceMarkers({
  onCityClick,
  selectedCity,
  show,
  showNames,
}: PlaceMarkersProps) {
  const { cities } = useMapData();
  const highlightedIds = useMapControl((state) => state.highlightedIds);
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  // Highlighted towns are always shown, even with the filter off or zoomed out
  const visibleCities = cities.filter(
    (city) =>
      highlightedIds.has(city.id) ||
      (show && zoom >= CITY_MIN_ZOOM[city.importance]),
  );

  return (
    <>
      {visibleCities.map((city) => {
        const isSelected = selectedCity === city.id;
        const isHighlighted = highlightedIds.has(city.id);
        return (
          <Marker
            key={city.id}
            position={[city.lat, city.lng]}
            icon={cityIcon(isSelected, isHighlighted)}
            zIndexOffset={isSelected ? 1000 : isHighlighted ? 500 : 0}
            eventHandlers={{ click: () => onCityClick(city.id) }}
          >
            {/* key forces Leaflet to rebind when the permanent/hover mode changes */}
            <Tooltip
              key={showNames ? "perm" : "hover"}
              permanent={showNames}
              direction="right"
              offset={[14, 0]}
              className="cx-place-label"
            >
              {city.name}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
