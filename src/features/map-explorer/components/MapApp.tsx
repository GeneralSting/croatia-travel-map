"use client";

import type { ReactNode } from "react";
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

/**
 * `children` are overlays rendered on top of the map once it has loaded, inside its providers - the
 * app layer composes other features in here (e.g. the voice assistant) without map-explorer having to
 * import them
 */
export default function MapApp({ children }: { children?: ReactNode }) {
  return <CroatiaMap>{children}</CroatiaMap>;
}
