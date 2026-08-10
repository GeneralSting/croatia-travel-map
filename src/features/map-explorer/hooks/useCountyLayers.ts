"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMap } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature, Geometry } from "geojson";
import { getGradientColor } from "@/features/map-explorer/utils/selectors";
import { useMapData } from "@/features/map-explorer/hooks/useMapData";
import {
  CountyProps,
  IslandProps,
  PathLayer,
  UseCountyLayersArgs,
} from "../types/mapShapes";

const HIGHLIGHT: PathOptions = {
  fillOpacity: 0.97,
  color: "#FFFFFF",
  weight: 2,
};

/**
 * All imperative Leaflet wiring behing MapShapes: per-feature style functions, the linked county-islands highlight/reset,
 * tooltip binding, the layer refs...
 * Consumer 'MapShapes' component itself is then just two <GeoJSON> layers fed the fout functions this hook returns
 */
export function useCountyLayers({
  islands,
  countyPercents,
  selectedCounty,
  onCountyClick,
}: UseCountyLayersArgs) {
  const { countyName } = useMapData();
  const map = useMap();
  const countyLayers = useRef<Record<string, PathLayer>>({});
  const islandLayers = useRef<Record<string, PathLayer>>({});

  /**
   * Sticky tooltip re-anchors to the cursor the instant we press the mouse (before any drag) and then fights
   * the pan for position while dragging - both read as jitter
   * Leaflet keeps re-opening the tooltip during its own mousedown handling, so instead of chasing its open/close
   * state we just hide these tooltips with CSS class while the button is held (covers a plain click and full
   * drag alike) and suppress the hover highlight meanwhile
   */
  const pointerDownRef = useRef(false);

  const islandIdsByCounty = useMemo(() => {
    const byCounty: Record<string, string[]> = {};
    islands?.features.forEach((feature) => {
      const { island_id, county_id } = feature.properties as IslandProps;
      (byCounty[county_id] ??= []).push(island_id);
    });
    return byCounty;
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

  /**
   * Highlight/reset a county togheter with all of its islands - islands are already drawn on a layer above the counties,
   * so we must not call 'bringToFront()' on them - doing so during 'mouseover' re-inserts the hovered path into the
   * DOM and stops Leaflet's matching 'mouseout' from firing (the highlight + tooltip get stuck)
   */
  const highlightCounty = useCallback(
    (countyId: string) => {
      if (pointerDownRef.current) return;
      countyLayers.current[countyId]?.setStyle(HIGHLIGHT);
      countyLayers.current[countyId]?.bringToFront();
      (islandIdsByCounty[countyId] ?? []).forEach((id) => {
        islandLayers.current[id]?.setStyle(HIGHLIGHT);
      });
    },
    [islandIdsByCounty],
  );

  const resetCounty = useCallback(
    (countyId: string) => {
      countyLayers.current[countyId]?.setStyle(countyStyle(countyId));
      (islandIdsByCounty[countyId] ?? []).forEach((id) => {
        islandLayers.current[id]?.setStyle(islandStyle(countyId));
      });
    },
    [countyStyle, islandStyle, islandIdsByCounty],
  );

  /* --- COUNTIES --- */
  const countyStyleFn = useCallback(
    (feature?: Feature<Geometry, CountyProps>) =>
      countyStyle(feature?.properties.county_id ?? ""),
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
        // While the button is held, skip the highlight (setStyle + bringToFront) churn; the
        // tooltip itself is hidden via the cx-tips-hidden class
        mouseover: () => highlightCounty(county_id),
        mouseout: () => resetCounty(county_id),
        click: () => onCountyClick(county_id),
      });
    },
    [countyPercents, highlightCounty, resetCounty, onCountyClick],
  );

  /* --- ISLANDS --- */
  const islandStyleFn = useCallback(
    (f?: Feature<Geometry, IslandProps>) =>
      islandStyle(f?.properties.county_id ?? ""),
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
          <span style="font-size:11px;opacity:0.7;">${countyName(county_id)} · ${percent}% explored</span>
        </div>`,
        { sticky: true, className: "custom-tooltip" },
      );
      // Hovering an island highlights the island together with its whole county
      layer.on({
        // While the button is held, skip the highlight (setStyle + bringToFront) churn; the
        // tooltip itself is hidden via the cx-tips-hidden class
        mouseover: () => highlightCounty(county_id),
        mouseout: () => resetCounty(county_id),
        click: () => onCountyClick(county_id),
      });
    },
    [countyPercents, highlightCounty, resetCounty, onCountyClick, countyName],
  );

  // While the mouse button is held (click or drag), hide tooltips and suppress the hover highlight
  useEffect(() => {
    const container = map.getContainer();
    const suppress = () => {
      pointerDownRef.current = true;
      container.classList.add("cx-tips-hidden");
    };
    const release = () => {
      pointerDownRef.current = false;
      container.classList.remove("cx-tips-hidden");
    };
    map.on("mousedown", suppress);
    map.on("mouseup", release);
    map.on("dragend", release); // fallback when the release happens off the map
    return () => {
      map.off("mousedown", suppress);
      map.off("mouseup", release);
      map.off("dragend", release);
      container.classList.remove("cx-tips-hidden");
    };
  }, [map]);

  return { countyStyleFn, islandStyleFn, onEachCounty, onEachIsland };
}
