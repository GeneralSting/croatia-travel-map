"use client";

// Simple static indicators: major towns as dots, notable mountains as triangles, each with an
// always-on label. They're non-interactive so they never steal hover/click from the shapes.

import { CircleMarker, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { TOWNS, MOUNTAINS } from "@/data/croatiaData";

const mountainIcon = L.divIcon({
  html: '<span class="cx-tri"></span>',
  className: "cx-mtn-icon",
  iconSize: [14, 12],
  iconAnchor: [7, 11],
});

export default function PlaceMarkers() {
  return (
    <>
      {TOWNS.map((t) => (
        <CircleMarker
          key={t.name}
          center={[t.lat, t.lng]}
          radius={4}
          pathOptions={{
            color: "#0b1220",
            weight: 2,
            fillColor: "#ffffff",
            fillOpacity: 1,
            interactive: false,
          }}
        >
          <Tooltip permanent direction="right" offset={[6, 0]} className="cx-place-label">
            {t.name}
          </Tooltip>
        </CircleMarker>
      ))}

      {MOUNTAINS.map((m) => (
        <Marker key={m.name} position={[m.lat, m.lng]} icon={mountainIcon} interactive={false}>
          <Tooltip permanent direction="right" offset={[8, 0]} className="cx-place-label">
            {m.name}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
