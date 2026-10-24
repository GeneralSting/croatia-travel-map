// Floating pill shown while the user is picking a spot for a new place. Kept mounted so it can
// fade + slide in/out; turns red when the clicked point is outside Croatia.

import { MapPin, X } from "lucide-react";

interface PlacementPillProps {
  active: boolean;
  error: boolean;
  onCancel: () => void;
}

export default function PlacementPill({
  active,
  error,
  onCancel,
}: PlacementPillProps) {
  return (
    <div
      className={`absolute top-3 left-1/2 -translate-x-1/2 z-1000 transition-all duration-300 ease-out ${
        active
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full text-white text-xs font-medium shadow-lg transition-colors duration-200 ${
          error ? "bg-red-600" : "bg-blue-600"
        }`}
      >
        <MapPin className="w-4 h-4" />
        <span className="max-w-[70vw] truncate">
          {error
            ? "That spot is outside Croatia — click on the map"
            : "Click the map to drop your pin"}
        </span>
        <button
          onClick={onCancel}
          className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
          title="Cancel (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
