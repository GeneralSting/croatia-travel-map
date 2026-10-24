"use client";

// The floating "add a place" control — a plain + button that sits to the left of the account
// menu (top-right of the map). Hovering it shows an "Add location" popover. Clicking it toggles
// placement mode; while active it turns into an X so a second click cancels. When Supabase is
// configured but nobody is signed in, it becomes a link to /login instead (you can't save a
// place while signed out).

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/features/auth-portal";
import { AUTH_PATHS } from "@/lib/data";

interface AddPlaceButtonProps {
  active: boolean;
  onToggle: () => void;
}

export default function AddPlaceButton({ active, onToggle }: AddPlaceButtonProps) {
  const { configured, user } = useAuth();
  const [hover, setHover] = useState(false);
  const loginRequired = configured && !user;

  const label = loginRequired
    ? "Sign in to add a place"
    : active
      ? "Cancel"
      : "Add location";

  const base =
    "relative flex h-11 w-11 items-center justify-center rounded-xl border shadow-2xl backdrop-blur-sm transition-colors";
  const tone = active
    ? "bg-blue-600 border-blue-400 text-white"
    : "bg-slate-900/90 border-white/10 text-white/80 hover:text-white hover:border-white/25";

  const tip = hover && (
    <span className="pointer-events-none absolute top-full right-0 mt-2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900/95 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-xl">
      {label}
    </span>
  );

  const hoverProps = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };

  if (loginRequired) {
    return (
      <Link href={AUTH_PATHS.LOGIN} className={`${base} ${tone}`} aria-label={label} {...hoverProps}>
        <Plus className="h-5 w-5" />
        {tip}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={active}
      className={`${base} ${tone}`}
      {...hoverProps}
    >
      {/* A + rotated 45° reads as an ✕ — one icon, smooth rotate between add / cancel. */}
      <Plus
        className={`h-5 w-5 transition-transform duration-300 ${
          active ? "rotate-45" : ""
        }`}
      />
      {tip}
    </button>
  );
}
