"use client";

import { useMemo, useState } from "react";
import {
  COUNTIES,
  POI_TYPES,
  cityCover,
  getCity,
  getCityPercent,
  getGradientColor,
  poisForCity,
  type POI,
  type POIDataMap,
  type PoiType,
} from "@/features/map-explorer/data";
import type { POIUpdate } from "@/features/map-explorer/hooks/useTravelData";
import { X, ChevronLeft, MapPin } from "lucide-react";
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

interface CityPanelProps {
  cityId: string;
  poiDataMap: POIDataMap;
  onClose: () => void;
  onBack: () => void;
  onPOIUpdate: (poiId: string, data: POIUpdate) => void | Promise<void>;
}

export default function CityPanel({
  cityId,
  poiDataMap,
  onClose,
  onBack,
  onPOIUpdate,
}: CityPanelProps) {
  const city = getCity(cityId);
  const [imgError, setImgError] = useState(false);

  const cityPois = useMemo(() => poisForCity(cityId), [cityId]);
  const groupedPois = useMemo(() => {
    const groups: Record<string, POI[]> = {};
    cityPois.forEach((poi) => {
      (groups[poi.type] ??= []).push(poi);
    });
    return TYPE_ORDER.filter((poiType) => groups[poiType]).map((poiType) => ({
      type: poiType,
      pois: groups[poiType],
    }));
  }, [cityPois]);

  if (!city) return null;

  const county = COUNTIES.find((county) => county.id === city.county_id);
  const percent = getCityPercent(cityId, poiDataMap);
  const visitedCount = cityPois.filter(
    (poi) => poiDataMap[poi.id]?.status === "visited",
  ).length;
  const fillColor = getGradientColor(percent);
  const showImage = !imgError;

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-white/10">
      {/* Cover image / placeholder */}
      <div className="relative flex-shrink-0 h-36 overflow-hidden">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cityCover(city)}
            alt={city.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-5xl font-black text-white/10 tracking-tight uppercase">
              {city.name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

        {/* Top controls over the image */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 pl-1.5 pr-2.5 py-1.5 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white/80 hover:text-white hover:bg-slate-900/90 transition-colors text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {county?.name ?? "Back"}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900/70 backdrop-blur-sm text-white/70 hover:text-white hover:bg-slate-900/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City name over the image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-2xl font-bold text-white leading-tight drop-shadow">
            {city.name}
          </h2>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-white/70">
            <MapPin className="w-3 h-3" />
            {county?.name}
          </div>
        </div>
      </div>

      {/* City info + progress */}
      <div className="flex-shrink-0 p-5 border-b border-white/10">
        <p className="text-sm text-white/60 leading-relaxed mb-4">{city.description}</p>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1E293B" strokeWidth="8" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={fillColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - percent / 100)}`}
                style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-white leading-none">{percent}%</span>
              <span className="text-[8px] text-white/40 leading-none mt-0.5">explored</span>
            </div>
          </div>
          <div className="flex-1 text-sm text-white/70">
            <p>
              <span className="font-semibold text-white">{visitedCount}</span> of{" "}
              <span className="font-semibold text-white">{cityPois.length}</span> places visited
            </p>
            <p className="text-xs text-white/40 mt-1">
              {cityPois.length} place{cityPois.length === 1 ? "" : "s"} to visit
            </p>
          </div>
        </div>
      </div>

      {/* Places to visit */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {cityPois.length === 0 ? (
          <p className="text-xs text-white/30 italic px-1 py-6 text-center">
            No places listed for {city.name} yet.
          </p>
        ) : (
          groupedPois.map(({ type, pois }) => {
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
          })
        )}
      </div>
    </div>
  );
}
