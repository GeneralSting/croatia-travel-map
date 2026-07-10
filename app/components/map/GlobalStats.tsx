import React from "react";
import { POIS, type POIDataMap } from "@/data/croatiaData";

interface GlobalStatsProps {
  poiDataMap: POIDataMap;
}

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
    {
      label: "POIs Visited",
      value: visitedPois,
      total: totalPois,
      color: "#16A34A",
    },
    {
      label: "Want to Visit",
      value: wantPois,
      total: totalPois,
      color: "#1D4ED8",
    },
    {
      label: "Croatia Explored",
      value: `${percentVisited}%`,
      color: "#D97706",
    },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 shadow-2xl">
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <div className="w-px h-8 bg-white/10 mx-3" />}
          <div className="text-center px-1">
            <div className="text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider whitespace-nowrap">
              {s.label}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
