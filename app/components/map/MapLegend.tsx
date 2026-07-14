"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MapLegend() {
  const [open, setOpen] = useState(false);

  const steps = [
    { color: "#334155", label: "0% — Unexplored" },
    { color: "#1D4ED8", label: "25% — Getting started" },
    { color: "#D97706", label: "50% — Halfway there" },
    { color: "#16A34A", label: "75% — Well explored" },
    { color: "#15803D", label: "100% — Fully explored" },
  ];

  return (
    <div className="hidden sm:block absolute top-8 left-4 z-1000 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl overflow-hidden">
      {/* Header — toggles the legend. Collapsed by default so it barely takes any space. */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        {/* Gradient chip as a compact hint of what the legend is about */}
        <span
          className="w-3 h-3 rounded-sm shrink-0"
          style={{ background: "linear-gradient(135deg, #334155, #1D4ED8, #16A34A)" }}
        />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
          Exploration Level
        </span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/40 ml-1" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-1" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-1.5">
          {steps.map(({ color, label }) => (
            <div key={color} className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-white/70 whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
