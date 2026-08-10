"use client";

import dynamic from "next/dynamic";
import MapLoading from "./MapLoading";

/**
 * Client entry point for the map
 * Leaflet touches window/document on import so the whole map tree must be loaded client-side only (ssr: false)
 * next/dynamic with ssr: false is only allowed inside a client component
 */
const CroatiaMap = dynamic(() => import("./CroatiaMap"), {
  ssr: false,
  loading: () => (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)",
      }}
    >
      <MapLoading />
    </div>
  ),
});

export default function MapApp() {
  return <CroatiaMap />;
}
