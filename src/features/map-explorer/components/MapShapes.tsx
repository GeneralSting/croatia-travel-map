"use client";

import { GeoJSON } from "react-leaflet";
import { useCountyLayers } from "@/features/map-explorer/hooks/useCountyLayers";
import { MapShapesProps } from "../types/mapShapes";

/**
 * Renders the county parcels and the breakout islands as two linked GeoJSON layers
 * Hovering an island highlights that island and its parent county, and hovering a county highlights
 * the county and all of its islands; islands are colored by their county's percent, and clicking an
 * island selects its county. All that interaction lives in useCountyLayers — this component just
 * feeds the two layers the style + onEachFeature functions it returns.
 */
export default function MapShapes({
  counties,
  islands,
  countyPercents,
  onCountyClick,
  selectedCounty,
}: MapShapesProps) {
  const { countyStyleFn, islandStyleFn, onEachCounty, onEachIsland } =
    useCountyLayers({ islands, countyPercents, selectedCounty, onCountyClick });

  // Remount the layers when the coloring inputs change so Leaflet re-runs style/onEachFeature.
  const key = JSON.stringify(countyPercents) + selectedCounty;

  return (
    <>
      <GeoJSON
        key={`counties-${key}`}
        data={counties}
        style={countyStyleFn}
        onEachFeature={onEachCounty}
      />
      {islands && (
        <GeoJSON
          key={`islands-${key}`}
          data={islands}
          style={islandStyleFn}
          onEachFeature={onEachIsland}
        />
      )}
    </>
  );
}
