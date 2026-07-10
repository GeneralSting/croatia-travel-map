"use client";

// Renders the county parcels and the breakout islands as two GeoJSON layers that are linked:
// hovering an island highlights that island AND its parent county, and hovering a county
// highlights the county AND all of its islands. Islands are colored by their county's percent
// and clicking an island selects its county (islands belong to a county).

import { useCallback, useMemo, useRef } from "react";
import { GeoJSON } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { COUNTIES, getGradientColor } from "@/data/croatiaData";

interface CountyProps {
  county_id: string;
  name: string;
}
interface IslandProps {
  island_id: string;
  name: string;
  county_id: string;
}

interface MapShapesProps {
  counties: FeatureCollection;
  islands: FeatureCollection | null;
  countyPercents: Record<string, number>;
  onCountyClick: (countyId: string) => void;
  selectedCounty: string | null;
}

const HIGHLIGHT: PathOptions = { fillOpacity: 0.97, color: "#FFFFFF", weight: 2 };

// Leaflet path layers expose setStyle/bringToFront; the GeoJSON typings give us a base Layer.
type PathLayer = Layer & {
  setStyle: (style: PathOptions) => void;
  bringToFront: () => void;
};

const countyNameById = Object.fromEntries(COUNTIES.map((c) => [c.id, c.name]));

export default function MapShapes({
  counties,
  islands,
  countyPercents,
  onCountyClick,
  selectedCounty,
}: MapShapesProps) {
  const countyLayers = useRef<Record<string, PathLayer>>({});
  const islandLayers = useRef<Record<string, PathLayer>>({});

  const islandIdsByCounty = useMemo(() => {
    const map: Record<string, string[]> = {};
    islands?.features.forEach((f) => {
      const { island_id, county_id } = f.properties as IslandProps;
      (map[county_id] ??= []).push(island_id);
    });
    return map;
  }, [islands]);

  const countyStyle = useCallback(
    (countyId: string): PathOptions => {
      const percent = countyPercents[countyId] ?? 0;
      const isSelected = selectedCounty === countyId;
      return {
        className: "cx-county",
        fillColor: getGradientColor(percent),
        fillOpacity: isSelected ? 0.88 : 0.72,
        color: isSelected ? "#FFFFFF" : "rgba(255,255,255,0.25)",
        weight: isSelected ? 2 : 0.8,
      };
    },
    [countyPercents, selectedCounty],
  );

  const islandStyle = useCallback(
    (countyId: string): PathOptions => {
      const percent = countyPercents[countyId] ?? 0;
      const isSelected = selectedCounty === countyId;
      return {
        className: "cx-island",
        fillColor: getGradientColor(percent),
        fillOpacity: isSelected ? 0.92 : 0.82,
        color: isSelected ? "#FFFFFF" : "rgba(255,255,255,0.5)",
        weight: isSelected ? 1.6 : 1,
      };
    },
    [countyPercents, selectedCounty],
  );

  // Highlight / reset a county together with all of its islands.
  // NOTE: islands are already drawn on a layer above the counties, so we must NOT call
  // bringToFront() on them — doing so during `mouseover` re-inserts the hovered path into the
  // DOM and stops Leaflet's matching `mouseout` from firing (the highlight + tooltip get stuck).
  const highlightCounty = useCallback((countyId: string) => {
    countyLayers.current[countyId]?.setStyle(HIGHLIGHT);
    countyLayers.current[countyId]?.bringToFront();
    (islandIdsByCounty[countyId] ?? []).forEach((id) => {
      islandLayers.current[id]?.setStyle(HIGHLIGHT);
    });
  }, [islandIdsByCounty]);

  const resetCounty = useCallback((countyId: string) => {
    countyLayers.current[countyId]?.setStyle(countyStyle(countyId));
    (islandIdsByCounty[countyId] ?? []).forEach((id) => {
      islandLayers.current[id]?.setStyle(islandStyle(countyId));
    });
  }, [countyStyle, islandStyle, islandIdsByCounty]);

  // ── Counties ────────────────────────────────────────────────────
  const countyStyleFn = useCallback(
    (f?: Feature<Geometry, CountyProps>) => countyStyle(f?.properties.county_id ?? ""),
    [countyStyle],
  );

  const onEachCounty = useCallback(
    (feature: Feature<Geometry, CountyProps>, layer: Layer) => {
      const { county_id, name } = feature.properties;
      countyLayers.current[county_id] = layer as PathLayer;
      const percent = countyPercents[county_id] ?? 0;
      layer.bindTooltip(
        `<div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-weight:600;font-size:13px;">${name}</span>
          <span style="font-size:11px;opacity:0.7;">${percent}% explored</span>
        </div>`,
        { sticky: true, className: "custom-tooltip" },
      );
      layer.on({
        mouseover: () => highlightCounty(county_id),
        mouseout: () => resetCounty(county_id),
        click: () => onCountyClick(county_id),
      });
    },
    [countyPercents, highlightCounty, resetCounty, onCountyClick],
  );

  // ── Islands ─────────────────────────────────────────────────────
  const islandStyleFn = useCallback(
    (f?: Feature<Geometry, IslandProps>) => islandStyle(f?.properties.county_id ?? ""),
    [islandStyle],
  );

  const onEachIsland = useCallback(
    (feature: Feature<Geometry, IslandProps>, layer: Layer) => {
      const { island_id, name, county_id } = feature.properties;
      islandLayers.current[island_id] = layer as PathLayer;
      const percent = countyPercents[county_id] ?? 0;
      layer.bindTooltip(
        `<div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-weight:600;font-size:13px;">${name}</span>
          <span style="font-size:11px;opacity:0.7;">${countyNameById[county_id] ?? ""} · ${percent}% explored</span>
        </div>`,
        { sticky: true, className: "custom-tooltip" },
      );
      // Hovering an island highlights the island together with its whole county.
      layer.on({
        mouseover: () => highlightCounty(county_id),
        mouseout: () => resetCounty(county_id),
        click: () => onCountyClick(county_id),
      });
    },
    [countyPercents, highlightCounty, resetCounty, onCountyClick],
  );

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
