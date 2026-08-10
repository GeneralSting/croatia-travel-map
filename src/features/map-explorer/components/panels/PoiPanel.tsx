"use client";

// Detail panel for a single POI, opened by clicking its pin on the map. Shows the place's
// description and the same tracking controls as POICard (status / rating / date / notes). For a
// user's own added place it also offers a Delete. Mirrors the county/city panels' look.

import { useState } from "react";
import Link from "next/link";
import type {
  POI,
  POIRecord,
  POIStatus,
} from "@/features/map-explorer/types/types";
import type { POIUpdate } from "@/features/map-explorer/hooks/useTravelData";
import { useMapData } from "@/features/map-explorer/hooks/useMapData";
import { useAuth } from "@/features/auth-portal";
import { AUTH_PATHS } from "@/lib/data";
import {
  X,
  Star,
  Calendar,
  MessageSquare,
  MapPin,
  Trash2,
  LogIn,
} from "lucide-react";

const STATUS_OPTIONS: {
  value: POIStatus;
  label: string;
  bg: string;
  text: string;
  border?: string;
}[] = [
  {
    value: "not_visited",
    label: "Not Visited",
    bg: "bg-slate-700",
    text: "text-slate-300",
  },
  {
    value: "want_to_visit",
    label: "Want to Visit",
    bg: "bg-blue-900/60",
    text: "text-blue-300",
    border: "border-blue-600",
  },
  {
    value: "visited",
    label: "Visited",
    bg: "bg-green-900/60",
    text: "text-green-300",
    border: "border-green-600",
  },
];

interface PoiPanelProps {
  poi: POI;
  userData?: POIRecord;
  onUpdate: (poiId: string, data: POIUpdate) => void | Promise<void>;
  onClose: () => void;
  /** Present only for a user's own added place. */
  onDelete?: () => void;
}

export default function PoiPanel({
  poi,
  userData,
  onUpdate,
  onClose,
  onDelete,
}: PoiPanelProps) {
  const { configured, user } = useAuth();
  const { getCounty, poiTypes } = useMapData();
  const loginRequired = configured && !user;

  const county = getCounty(poi.county_id);
  const typeInfo = poiTypes[poi.type] ?? poiTypes.landmark;

  const [data, setData] = useState<POIUpdate>({
    status: userData?.status || "not_visited",
    rating: userData?.rating || 0,
    date_visited: userData?.date_visited || "",
    notes: userData?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (field: keyof POIUpdate, value: string | number) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const changeStatus = async (status: POIStatus) => {
    const next = { ...data, status };
    setData(next);
    setSaving(true);
    await onUpdate(poi.id, next);
    setSaving(false);
  };

  const save = async () => {
    setSaving(true);
    await onUpdate(poi.id, data);
    setSaving(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-white/10">
      {/* Header */}
      <div className="flex-shrink-0 p-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl leading-none flex-shrink-0">
              {typeInfo.icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight">
                {poi.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                <span
                  className="px-2 py-0.5 rounded-full border text-[10px]"
                  style={{ borderColor: typeInfo.color, color: typeInfo.color }}
                >
                  {typeInfo.label}
                </span>
                {county && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {county.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {poi.description && (
          <p className="text-sm text-white/60 italic leading-relaxed">
            {poi.description}
          </p>
        )}

        {loginRequired ? (
          <Link
            href={AUTH_PATHS.LOGIN}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-white/10 bg-slate-800/60 text-xs text-white/60 hover:text-white hover:border-white/25 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign in to track this place
          </Link>
        ) : (
          <>
            {/* Status */}
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                Status
              </p>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => changeStatus(option.value)}
                    className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-all ${
                      data.status === option.value
                        ? `${option.bg} ${option.text} ${option.border || "border-slate-600"} opacity-100`
                        : "bg-slate-800 text-white/40 border-white/5 hover:border-white/20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visited-only fields */}
            {data.status === "visited" && (
              <>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                    Rating
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setField("rating", star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className="w-5 h-5"
                          fill={
                            (data.rating ?? 0) >= star
                              ? "#F59E0B"
                              : "transparent"
                          }
                          stroke={
                            (data.rating ?? 0) >= star ? "#F59E0B" : "#475569"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Date Visited
                  </label>
                  <input
                    type="date"
                    value={data.date_visited ?? ""}
                    onChange={(e) => setField("date_visited", e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
                <MessageSquare className="w-3 h-3" /> Notes
              </label>
              <textarea
                value={data.notes ?? ""}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Add your impressions, tips, memories..."
                rows={3}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/25 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        )}

        {/* Delete (user's own place only) */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 py-2 mt-2 text-xs text-red-400/80 hover:text-red-400 border border-red-900/40 hover:border-red-700/60 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete this place
          </button>
        )}
      </div>
    </div>
  );
}
