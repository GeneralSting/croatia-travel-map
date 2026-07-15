"use client";

import { useState } from "react";
import Link from "next/link";
import {
  POI_TYPES,
  type POI,
  type POIRecord,
  type POIStatus,
} from "@/data/croatiaData";
import type { POIUpdate } from "@/lib/useTravelData";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Star,
  ChevronDown,
  ChevronUp,
  Calendar,
  MessageSquare,
  LogIn,
} from "lucide-react";

interface StatusOption {
  value: POIStatus;
  label: string;
  bg: string;
  text: string;
  border?: string;
}

const STATUS_OPTIONS: StatusOption[] = [
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

interface POICardProps {
  poi: POI;
  userData?: POIRecord;
  onUpdate: (poiId: string, data: POIUpdate) => void | Promise<void>;
}

export default function POICard({ poi, userData, onUpdate }: POICardProps) {
  const { configured, user } = useAuth();
  // Once Supabase is set up, tracking requires an account.
  const loginRequired = configured && !user;

  const [expanded, setExpanded] = useState(false);
  const [localData, setLocalData] = useState<POIUpdate>({
    status: userData?.status || "not_visited",
    rating: userData?.rating || 0,
    date_visited: userData?.date_visited || "",
    notes: userData?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const poiType = POI_TYPES[poi.type] || POI_TYPES.landmark;
  const currentStatus =
    STATUS_OPTIONS.find((s) => s.value === localData.status) ||
    STATUS_OPTIONS[0];

  const handleStatusChange = async (newStatus: POIStatus) => {
    const updated = { ...localData, status: newStatus };
    setLocalData(updated);
    setSaving(true);
    await onUpdate(poi.id, updated);
    setSaving(false);
  };

  const handleFieldUpdate = (
    field: keyof POIUpdate,
    value: string | number,
  ) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(poi.id, localData);
    setSaving(false);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        localData.status === "visited"
          ? "border-green-800/50 bg-green-950/20"
          : localData.status === "want_to_visit"
            ? "border-blue-800/50 bg-blue-950/20"
            : "border-white/5 bg-slate-800/40"
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-lg flex-shrink-0">{poiType.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-tight truncate">
            {poi.name}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">{poiType.label}</p>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border || "border-slate-600"} flex-shrink-0`}
        >
          {currentStatus.label}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* Description */}
          <p className="text-xs text-white/50 italic">{poi.description}</p>

          {loginRequired ? (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-white/10 bg-slate-800/60 text-xs text-white/60 hover:text-white hover:border-white/25 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in to track this place
            </Link>
          ) : (
            <>
              {/* Status toggle buttons */}
              <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
              Status
            </p>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-all ${
                    localData.status === s.value
                      ? `${s.bg} ${s.text} ${s.border || "border-slate-600"} opacity-100`
                      : "bg-slate-800 text-white/40 border-white/5 hover:border-white/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visited-only fields */}
          {localData.status === "visited" && (
            <>
              {/* Star rating */}
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                  Rating
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleFieldUpdate("rating", star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className="w-5 h-5"
                        fill={
                          (localData.rating ?? 0) >= star
                            ? "#F59E0B"
                            : "transparent"
                        }
                        stroke={
                          (localData.rating ?? 0) >= star
                            ? "#F59E0B"
                            : "#475569"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Date visited */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Date Visited
                </label>
                <input
                  type="date"
                  value={localData.date_visited ?? ""}
                  onChange={(e) =>
                    handleFieldUpdate("date_visited", e.target.value)
                  }
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
              value={localData.notes ?? ""}
              onChange={(e) => handleFieldUpdate("notes", e.target.value)}
              placeholder="Add your impressions, tips, memories..."
              rows={2}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/25 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
