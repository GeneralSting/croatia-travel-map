"use client";

// Reports map clicks to the parent while "add a place" placement mode is active, and switches
// the cursor to a crosshair so it's obvious the next click drops the pin. Renders nothing.

import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

interface MapClickHandlerProps {
  active: boolean;
  onPick: (lat: number, lng: number) => void;
}

export default function MapClickHandler({ active, onPick }: MapClickHandlerProps) {
  const map = useMap();

  useMapEvents({
    click: (e) => {
      if (active) onPick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = active ? "crosshair" : "";
    return () => {
      container.style.cursor = "";
    };
  }, [active, map]);

  return null;
}
