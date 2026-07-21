"use client";

import { useState, useMemo } from "react";
import {
  COUNTIES,
  POIS,
  POI_TYPES,
  citiesForCounty,
  getCityPercent,
  getGradientColor,
  looseCountyPois,
  type CountyDataMap,
  type POI,
  type POIDataMap,
  type PoiType,
  type UserPoi,
} from "@/features/map-explorer/data";
import type { POIUpdate } from "@/features/map-explorer/hooks/useTravelData";
import { X, RotateCcw, SlidersHorizontal, ChevronRight } from "lucide-react";
import POICard from "./POICard";

const TYPE_ORDER: PoiType[] = [
  "city",
  "national_park",
  "island",
  "mountain",
  "lake",
  "river",
  "campsite",
  "nature",
  "landmark",
];

interface CountyPanelProps {
  countyId: string;
  poiDataMap: POIDataMap;
  countyDataMap: CountyDataMap;
  userPois: UserPoi[];
  onClose: () => void;
  onCitySelect: (cityId: string) => void;
  onPoiSelect: (poiId: string) => void;
  onPOIUpdate: (poiId: string, data: POIUpdate) => void | Promise<void>;
  onCountyOverride: (
    countyId: string,
    percent: number,
    isManual: boolean,
  ) => void;
}

export default function CountyPanel({
  countyId,
  poiDataMap,
  countyDataMap,
  userPois,
  onClose,
  onCitySelect,
  onPoiSelect,
  onPOIUpdate,
  onCountyOverride,
}: CountyPanelProps) {
  const county = COUNTIES.find((c) => c.id === countyId);
  const countyPois = POIS.filter((p) => p.county_id === countyId);
  const cities = citiesForCounty(countyId);
  const loosePois = looseCountyPois(countyId);
  const myPlaces = userPois.filter((p) => p.county_id === countyId);
  const countyRecord = countyDataMap[countyId];
  const isManual = countyRecord?.is_manual_override;
  const [showSlider, setShowSlider] = useState(false);

  const autoPercent = useMemo(() => {
    if (countyPois.length === 0) return 0;
    const visited = countyPois.filter(
      (p) => poiDataMap[p.id]?.status === "visited",
    ).length;
    return Math.round((visited / countyPois.length) * 100);
  }, [countyPois, poiDataMap]);

  const displayPercent =
    isManual && countyRecord?.visited_percent != null
      ? countyRecord.visited_percent
      : autoPercent;

  const groupedPois = useMemo(() => {
    const groups: Record<string, POI[]> = {};
    loosePois.forEach((poi) => {
      if (!groups[poi.type]) groups[poi.type] = [];
      groups[poi.type].push(poi);
    });
    return TYPE_ORDER.filter((t) => groups[t]).map((t) => ({
      type: t,
      pois: groups[t],
    }));
  }, [loosePois]);

  const visitedCount = countyPois.filter(
    (p) => poiDataMap[p.id]?.status === "visited",
  ).length;
  const wantCount = countyPois.filter(
    (p) => poiDataMap[p.id]?.status === "want_to_visit",
  ).length;
  const fillColor = getGradientColor(displayPercent);

  const handleSliderChange = (val: string) => {
    onCountyOverride(countyId, parseInt(val), true);
  };

  const handleResetAuto = () => {
    onCountyOverride(countyId, autoPercent, false);
    setShowSlider(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-white/10">
      {/* Header */}
      <div className="flex-shrink-0 p-5 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">
              {county?.name}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-white/50">
                {cities.length > 0 &&
                  `${cities.length} ${cities.length === 1 ? "city" : "cities"} · `}
                {countyPois.length} points of interest
              </span>
              {isManual && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700/40">
                  Manual override
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress ring + stats */}
        <div className="flex items-center gap-4">
          {/* Circular progress */}
          <div className="relative flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#1E293B"
                strokeWidth="8"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={fillColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - displayPercent / 100)}`}
                style={{
                  transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white leading-none">
                {displayPercent}%
              </span>
              <span className="text-[9px] text-white/40 leading-none mt-0.5">
                explored
              </span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-xs text-white/70">
                {visitedCount} visited
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="text-xs text-white/70">
                {wantCount} want to visit
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
              <span className="text-xs text-white/70">
                {countyPois.length - visitedCount - wantCount} unexplored
              </span>
            </div>
          </div>
        </div>

        {/* Manual override controls */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSlider(!showSlider)}
              className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {showSlider ? "Hide override" : "Override percentage"}
            </button>
            {isManual && (
              <button
                onClick={handleResetAuto}
                className="flex items-center gap-1 text-[11px] text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to auto
              </button>
            )}
          </div>

          {showSlider && (
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  defaultValue={displayPercent}
                  onChange={(e) => handleSliderChange(e.target.value)}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs text-white/60 w-10 text-right">
                  {displayPercent}%
                </span>
              </div>
              <p className="text-[10px] text-white/30">
                Drag to manually set the county&apos;s explored percentage
              </p>
            </div>
          )}
        </div>
      </div>

      {/* POI list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* My places — the user's own added pins in this county */}
        {myPlaces.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📍</span>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                My Places
              </p>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-2">
              {myPlaces.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPoiSelect(p.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-slate-800/40 hover:bg-slate-800/80 hover:border-white/20 transition-all text-left"
                >
                  <span className="text-lg shrink-0">{POI_TYPES[p.type].icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-tight truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">{POI_TYPES[p.type].label}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cities & towns — click through to a city's own places to visit */}
        {cities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🏙️</span>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                Cities &amp; Towns
              </p>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-2">
              {cities.map((city) => {
                const cityPercent = getCityPercent(city.id, poiDataMap);
                return (
                  <button
                    key={city.id}
                    onClick={() => onCitySelect(city.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-slate-800/40 hover:bg-slate-800/80 hover:border-white/20 transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-tight truncate">
                        {city.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cityPercent}%`,
                              backgroundColor: getGradientColor(cityPercent),
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-white/40">
                          {cityPercent}% explored
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {groupedPois.map(({ type, pois }) => {
          const typeInfo = POI_TYPES[type];
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{typeInfo.icon}</span>
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                  {typeInfo.label}
                </p>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-2">
                {pois.map((poi) => (
                  <POICard
                    key={poi.id}
                    poi={poi}
                    userData={poiDataMap[poi.id]}
                    onUpdate={onPOIUpdate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
