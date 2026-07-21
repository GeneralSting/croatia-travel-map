"use client";

// The form that appears once the user clicks a spot in placement mode: a provisional pin at the
// clicked coordinates with a popup bubble anchored to it. The pin shows the currently selected
// type's emoji (updates live), and the popup collects a name + type with Confirm / Cancel. The
// county is inferred from the coordinates by the parent — the user never picks one.

import { useEffect, useMemo, useRef, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { POI_TYPES, type PoiType } from "@/features/map-explorer/data";

interface AddPlaceFormProps {
  lat: number;
  lng: number;
  onConfirm: (name: string, type: PoiType) => void;
  onCancel: () => void;
}

const TYPE_ORDER = Object.keys(POI_TYPES) as PoiType[];

export default function AddPlaceForm({ lat, lng, onConfirm, onCancel }: AddPlaceFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PoiType>("landmark");
  const markerRef = useRef<L.Marker | null>(null);

  // Provisional pin — reuses the POI pin styling (selected variant) so it reads as a brand-new
  // highlighted place, and reflects the chosen type.
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "cx-poi-icon",
        html: `<span class="cx-poi-pin cx-poi-pin--sel" style="--poi:${POI_TYPES[type].color}">${POI_TYPES[type].icon}</span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    [type],
  );

  // Open the form bubble as soon as the marker is on the map.
  useEffect(() => {
    markerRef.current?.openPopup();
  }, []);

  const submit = () => {
    const n = name.trim();
    if (n) onConfirm(n, type);
  };

  return (
    <Marker position={[lat, lng]} icon={icon} ref={markerRef} zIndexOffset={2000}>
      <Popup
        className="cx-form-popup"
        closeButton={false}
        autoClose={false}
        closeOnClick={false}
      >
        <div
          className="w-[210px] space-y-2 p-3"
          onKeyDown={(e) => e.key === "Escape" && onCancel()}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
            New place
          </p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Name (e.g. Grandma's beach)"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1.5 text-xs text-white placeholder-white/25 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PoiType)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1.5 text-xs text-white/80 focus:border-blue-500 focus:outline-none"
          >
            {TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {POI_TYPES[t].icon} {POI_TYPES[t].label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 pt-0.5">
            <button
              type="button"
              onClick={submit}
              disabled={!name.trim()}
              className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:bg-slate-700 disabled:text-white/40"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white/80"
            >
              Cancel
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
