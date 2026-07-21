"use client";

// Reports map clicks to the parent while "add a place" placement mode is active, and tags the
// map container with `cx-placing` so CSS can show the pin cursor (and switch it to the grab
// cursor while the user is panning — see globals.css). Renders nothing.

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
    container.classList.toggle("cx-placing", active);
    return () => {
      container.classList.remove("cx-placing");
    };
  }, [active, map]);

  return null;
}
