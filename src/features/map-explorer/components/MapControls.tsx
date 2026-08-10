"use client";

// Combined account + map-controls accordion (top-left of the map). Collapsed, its header is an
// account chip: avatar + name, with a secondary "map filters" note. Expanded, it shows the
// signed-in email + sign-out, then the display/name toggle and the per-type filters. Owns no
// state itself — display settings come from CroatiaMap; auth comes from useAuth.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  LogIn,
  Star,
} from "lucide-react";
import type { PoiType } from "@/features/map-explorer/types/types";
import { useMapData } from "@/features/map-explorer/hooks/useMapData";
import { useAuth } from "@/features/auth-portal";
import { AUTH_PATHS } from "@/lib/data";

interface MapControlsProps {
  showNames: boolean;
  onToggleNames: () => void;
  enabledTypes: Record<PoiType, boolean>;
  onToggleType: (type: PoiType) => void;
  /** "My places" filter — shows the user's custom POIs regardless of their type. */
  showCustom: boolean;
  onToggleCustom: () => void;
}

export default function MapControls({
  showNames,
  onToggleNames,
  enabledTypes,
  onToggleType,
  showCustom,
  onToggleCustom,
}: MapControlsProps) {
  const { user, configured, loading, signOut } = useAuth();
  const { poiTypes, poiTypeOrder } = useMapData();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push(AUTH_PATHS.LOGIN);
  };

  const meta = (user?.user_metadata ?? {}) as Record<
    string,
    string | undefined
  >;
  const fullName =
    meta.full_name ||
    meta.name ||
    (user?.email ? user.email.split("@")[0] : "");
  const avatarUrl = !imgError ? meta.avatar_url || meta.picture || null : null;
  const initials =
    (fullName || user?.email || "?")
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const hiddenCount =
    poiTypeOrder.filter((type) => !enabledTypes[type]).length +
    (showCustom ? 0 : 1);

  const primary = user
    ? fullName || "Account"
    : configured
      ? loading
        ? "…"
        : "Guest"
      : "Map filters";
  const secondary = user
    ? "Account & map filters"
    : configured
      ? "Sign in · map filters"
      : "Filter what's shown";

  return (
    <div className="w-60 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl overflow-hidden">
      {/* Header — account chip that toggles the panel */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
        aria-expanded={open}
      >
        {user && avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {user ? initials : <SlidersHorizontal className="w-4 h-4" />}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {primary}
          </p>
          <p className="text-[10px] text-white/40 leading-tight truncate mt-0.5">
            {secondary}
          </p>
        </div>
        {hiddenCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600/80 text-white leading-none shrink-0">
            {hiddenCount}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Animated body: the grid-rows 0fr→1fr trick lets height ease open/closed. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div
          className={`min-h-0 overflow-hidden transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="px-3 pb-3 pt-1 space-y-3">
            {/* Account row */}
            {configured && (
              <>
                {user ? (
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs text-white/60 truncate"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg border border-white/10 hover:border-white/25 transition-colors shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href={AUTH_PATHS.LOGIN}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign in
                  </Link>
                )}
                <div className="h-px bg-white/10" />
              </>
            )}

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
                {poiTypeOrder.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={enabledTypes[type]}
                      onChange={() => onToggleType(type)}
                      className="w-3.5 h-3.5 accent-blue-500"
                    />
                    <span className="text-sm leading-none">
                      {poiTypes[type]?.icon}
                    </span>
                    <span className="text-xs text-white/70">
                      {poiTypes[type]?.label}
                    </span>
                  </label>
                ))}

                {/* My places — the user's custom POIs, shown regardless of their type filter. */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none border-t border-white/5 mt-1.5 pt-2">
                  <input
                    type="checkbox"
                    checked={showCustom}
                    onChange={onToggleCustom}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-white/70">My places</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
