"use client";

// City markers + mountain indicators. Cities are clickable (they open a city panel) and are
// revealed progressively by zoom: only the major cities show when zoomed out, smaller towns
// appear as you zoom in (see CITY_MIN_ZOOM / each city's `importance`). Mountains stay simple,
// non-interactive triangles and only appear once you've zoomed in a little.

import { useState } from "react";
import { CircleMarker, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { CITIES, CITY_MIN_ZOOM, MOUNTAINS } from "@/data/croatiaData";

const mountainIcon = L.divIcon({
  html: '<span class="cx-tri"></span>',
  className: "cx-mtn-icon",
  iconSize: [14, 12],
  iconAnchor: [7, 11],
});

const MOUNTAIN_MIN_ZOOM = 8;

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
        const baseRadius = c.importance === 1 ? 5.5 : c.importance === 2 ? 4.5 : 3.5;
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={isSelected ? baseRadius + 2 : baseRadius}
            pathOptions={{
              color: isSelected ? "#38BDF8" : "#0b1220",
              weight: 2,
              fillColor: isSelected ? "#38BDF8" : "#ffffff",
              fillOpacity: 1,
            }}
            eventHandlers={{
              // react-leaflet v5 doesn't forward pathOptions.className to CircleMarker paths,
              // so tag the SVG element on add to enable the hover/cursor styles in globals.css.
              add: (e) => (e.target as L.CircleMarker).getElement()?.classList.add("cx-city"),
              click: () => onCityClick(c.id),
            }}
          >
            <Tooltip permanent direction="right" offset={[6, 0]} className="cx-place-label">
              {c.name}
            </Tooltip>
          </CircleMarker>
        );
      })}

      {zoom >= MOUNTAIN_MIN_ZOOM &&
        MOUNTAINS.map((m) => (
          <Marker key={m.name} position={[m.lat, m.lng]} icon={mountainIcon} interactive={false}>
            <Tooltip permanent direction="right" offset={[8, 0]} className="cx-place-label">
              {m.name}
            </Tooltip>
          </Marker>
        ))}
    </>
  );
}
