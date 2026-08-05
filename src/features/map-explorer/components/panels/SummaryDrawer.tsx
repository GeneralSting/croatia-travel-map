"use client";

import { useState } from "react";
import {
  COUNTIES,
  POIS,
  getGradientColor,
  type POIDataMap,
} from "@/features/map-explorer/data";
import { ChevronUp, ChevronDown, Map } from "lucide-react";

interface SummaryDrawerProps {
  poiDataMap: POIDataMap;
  countyPercents: Record<string, number>;
  onCountySelect: (countyId: string) => void;
}

export default function SummaryDrawer({
  poiDataMap,
  countyPercents,
  onCountySelect,
}: SummaryDrawerProps) {
  const [open, setOpen] = useState(false);

  const totalPois = POIS.length;
  const visitedPois = POIS.filter(
    (poi) => poiDataMap[poi.id]?.status === "visited",
  ).length;
  const wantPois = POIS.filter(
    (poi) => poiDataMap[poi.id]?.status === "want_to_visit",
  ).length;
  const percentExplored =
    totalPois > 0 ? Math.round((visitedPois / totalPois) * 100) : 0;
  const countiesStarted = COUNTIES.filter(
    (county) => (countyPercents[county.id] ?? 0) > 0,
  ).length;
  const countiesCompleted = COUNTIES.filter(
    (county) => (countyPercents[county.id] ?? 0) >= 100,
  ).length;

  const sortedCounties = [...COUNTIES]
    .map((county) => ({ ...county, percent: countyPercents[county.id] ?? 0 }))
    .sort((countyA, countyB) => countyB.percent - countyA.percent);

  const wantCounties = COUNTIES.filter((county) =>
    POIS.some(
      (poi) =>
        poi.county_id === county.id &&
        poiDataMap[poi.id]?.status === "want_to_visit",
    ),
  );

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-[999] transition-all duration-300 ${open ? "max-h-[70vh]" : "max-h-14"} overflow-hidden`}
    >
      {/* Handle bar */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between bg-slate-900/95 backdrop-blur-sm border-t border-white/10 px-5 py-4 cursor-pointer hover:bg-slate-800/95 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Map className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">
            Journey Summary
          </span>
          <div className="flex items-center gap-3 text-xs text-white/40 ml-2">
            <span className="text-amber-500 font-semibold">
              {percentExplored}% explored
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{visitedPois} visited</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{wantPois} planned</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{countiesStarted} counties started</span>
          </div>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronUp className="w-4 h-4 text-white/40" />
        )}
      </div>

      {/* Content */}
      {open && (
        <div className="bg-slate-900/95 backdrop-blur-sm border-t border-white/5 overflow-y-auto max-h-[calc(70vh-3.5rem)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Stats column */}
            <div className="p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Overall Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "POIs Visited",
                    value: visitedPois,
                    color: "#16A34A",
                  },
                  { label: "Want to Visit", value: wantPois, color: "#1D4ED8" },
                  {
                    label: "Counties Started",
                    value: countiesStarted,
                    color: "#D97706",
                  },
                  {
                    label: "Fully Explored",
                    value: countiesCompleted,
                    color: "#15803D",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-800/50 rounded-xl p-3">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* County leaderboard */}
            <div className="p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                County Leaderboard
              </h3>
              <div className="space-y-2">
                {sortedCounties.slice(0, 8).map((county) => (
                  <div
                    key={county.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1 -mx-2 transition-colors"
                    onClick={() => {
                      onCountySelect(county.id);
                      setOpen(false);
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getGradientColor(county.percent) }}
                    />
                    <span className="text-xs text-white/70 flex-1 truncate">
                      {county.name}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${county.percent}%`,
                            backgroundColor: getGradientColor(county.percent),
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/40 w-8 text-right">
                        {county.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Want to visit */}
            <div className="p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Plan to Visit
              </h3>
              {wantCounties.length === 0 ? (
                <p className="text-xs text-white/30 italic">
                  Mark POIs as &quot;Want to Visit&quot; to see them here
                </p>
              ) : (
                <div className="space-y-1.5">
                  {wantCounties.map((county) => {
                    const wantInCounty = POIS.filter(
                      (poi) =>
                        poi.county_id === county.id &&
                        poiDataMap[poi.id]?.status === "want_to_visit",
                    );
                    return (
                      <div
                        key={county.id}
                        className="cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                        onClick={() => {
                          onCountySelect(county.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/70 font-medium">
                            {county.name}
                          </span>
                          <span className="text-[10px] text-blue-400">
                            {wantInCounty.length} planned
                          </span>
                        </div>
                        <div className="text-[10px] text-white/30 mt-0.5 truncate">
                          {wantInCounty
                            .slice(0, 2)
                            .map((poi) => poi.name)
                            .join(", ")}
                          {wantInCounty.length > 2
                            ? ` +${wantInCounty.length - 2} more`
                            : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
