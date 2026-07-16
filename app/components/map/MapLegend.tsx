"use client";

// Map display controls, living in a collapsed-by-default accordion (top-left). Lets the user
// toggle permanent POI name labels and filter which POI types are shown. The actual state is
// owned by CroatiaMap and shared with the marker layers.

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { POI_TYPES, type PoiType } from "@/data/croatiaData";

const TYPE_ORDER = Object.keys(POI_TYPES) as PoiType[];

interface MapLegendProps {
  showNames: boolean;
  onToggleNames: () => void;
  enabledTypes: Record<PoiType, boolean>;
  onToggleType: (type: PoiType) => void;
}

export default function MapLegend({
  showNames,
  onToggleNames,
  enabledTypes,
  onToggleType,
}: MapLegendProps) {
  const [open, setOpen] = useState(false);
  const hiddenCount = TYPE_ORDER.filter((t) => !enabledTypes[t]).length;

  return (
    <div className="hidden sm:block absolute top-8 left-4 z-1000 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl overflow-hidden">
      {/* Header — toggles the panel. Collapsed by default so it barely takes any space. */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-white/50 shrink-0" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
          Map Filters
        </span>
        {hiddenCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600/80 text-white leading-none">
            {hiddenCount} hidden
          </span>
        )}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/40 ml-1" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-1" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 w-56 space-y-3">
          {/* Names toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showNames}
              onChange={onToggleNames}
              className="w-3.5 h-3.5 accent-blue-500"
            />
            <span className="text-xs text-white/80">Display POI names</span>
          </label>

          <div className="h-px bg-white/10" />

          {/* Type filters */}
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
              Show types
            </p>
            <div className="space-y-1.5">
              {TYPE_ORDER.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2.5 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={enabledTypes[t]}
                    onChange={() => onToggleType(t)}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />
                  <span className="text-sm leading-none">{POI_TYPES[t].icon}</span>
                  <span className="text-xs text-white/70">{POI_TYPES[t].label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
