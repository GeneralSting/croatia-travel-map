"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import { useMapControl } from "@/features/map-explorer/hooks/useMapControl";
import {
  countyBounds,
  pointsBounds,
  type BoundsTuple,
} from "@/features/map-explorer/utils/geo";
import { FOCUS_ZOOM } from "@/features/map-explorer/store/mapControlStore";

const FIT_PADDING: [number, number] = [40, 40];

interface MapCameraControllerProps {
  counties: FeatureCollection;
  islands: FeatureCollection | null;
}

/**
 * Applies camera requests from the map-control store to the Leaflet map. Lives inside <MapContainer>
 * (the only place useMap() works), renders nothing, and is the single spot that moves the camera -
 * the store only says *where*, this component knows *how*
 */
export default function MapCameraController({
  counties,
  islands,
}: MapCameraControllerProps) {
  const map = useMap();
  const camera = useMapControl((state) => state.camera);
  const appliedSeq = useRef(0); // re-renders (e.g. islands loading) must not replay an old request

  useEffect(() => {
    if (!camera || camera.seq === appliedSeq.current) return;
    appliedSeq.current = camera.seq;

    /**
     * The side panel shares the row with the map, so opening it (often in the same update as this
     * request) shrinks the map container - Leaflet must re-measure before computing where to fly
     */
    map.invalidateSize({ pan: false });
    const size = map.getSize();
    const hasSize = size.x > 0 && size.y > 0; // mobile: a full-width panel hides the map entirely
    const animate =
      hasSize && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const { target } = camera;
    if (target.kind === "point") {
      const center: [number, number] = [target.lat, target.lng];
      if (animate) map.flyTo(center, target.zoom);
      else map.setView(center, target.zoom, { animate: false });
      return;
    }

    const bounds: BoundsTuple | null =
      target.kind === "county"
        ? countyBounds(target.countyId, counties, islands)
        : pointsBounds(target.points);
    if (!bounds) return;

    if (!hasSize) {
      // Fitting needs real pixel dimensions - just centre the bounds so the map is right once shown
      const [[south, west], [north, east]] = bounds;
      map.setView([(south + north) / 2, (west + east) / 2], 9, { animate: false });
      return;
    }
    const options = { padding: FIT_PADDING, maxZoom: FOCUS_ZOOM };
    if (animate) map.flyToBounds(bounds, options);
    else map.fitBounds(bounds, { ...options, animate: false });
  }, [camera, map, counties, islands]);

  return null;
}
