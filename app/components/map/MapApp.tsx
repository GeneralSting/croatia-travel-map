"use client";

// Client entry point for the map. Leaflet touches `window`/`document` on import, so the
// whole map tree must be loaded client-side only (`ssr: false`). `next/dynamic` with
// `ssr: false` is only allowed inside a Client Component, which is why this wrapper exists.

import dynamic from "next/dynamic";
import { Compass } from "lucide-react";

const CroatiaMap = dynamic(() => import("./CroatiaMap"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Compass
          className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin"
          style={{ animationDuration: "2s" }}
        />
        <p className="text-white/60 text-sm">Loading Croatia map...</p>
      </div>
    </div>
  ),
});

export default function MapApp() {
  return <CroatiaMap />;
}
