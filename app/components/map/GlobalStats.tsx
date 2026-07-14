import React from "react";
import { POIS, type POIDataMap } from "@/data/croatiaData";

interface GlobalStatsProps {
  poiDataMap: POIDataMap;
}

// Rendered inline on the right of the top bar. Full three-stat row on sm+, condensed to just
// the explored percentage on mobile so it never crowds the header.
export default function GlobalStats({ poiDataMap }: GlobalStatsProps) {
  const totalPois = POIS.length;
  const visitedPois = POIS.filter(
    (p) => poiDataMap[p.id]?.status === "visited",
  ).length;
  const wantPois = POIS.filter(
    (p) => poiDataMap[p.id]?.status === "want_to_visit",
  ).length;
  const percentVisited =
    totalPois > 0 ? Math.round((visitedPois / totalPois) * 100) : 0;

  const stats = [
    { label: "Visited", value: visitedPois, color: "#16A34A" },
    { label: "Planned", value: wantPois, color: "#1D4ED8" },
    { label: "Explored", value: `${percentVisited}%`, color: "#D97706" },
  ];

  return (
    <>
      {/* Full stats on larger screens */}
      <div className="hidden sm:flex items-center">
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div className="w-px h-7 bg-white/10 mx-3" />}
            <div className="text-center px-1">
              <div
                className="text-base font-bold leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-[9px] text-white/50 uppercase tracking-wider whitespace-nowrap mt-1">
                {s.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Condensed on mobile: just the explored percentage */}
      <div className="sm:hidden text-right leading-none">
        <div className="text-base font-bold" style={{ color: "#D97706" }}>
          {percentVisited}%
        </div>
        <div className="text-[9px] text-white/50 uppercase tracking-wider mt-0.5">
          Explored
        </div>
      </div>
    </>
  );
}
