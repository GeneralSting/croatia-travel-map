"use client";

// The controls floating over the top-right of the map: the add-place button and the account +
// display-filters accordion. Purely presentational grouping — state lives in the orchestrator.

import type { PoiType } from "@/features/map-explorer/types/types";
import AddPlaceButton from "@/features/map-explorer/components/AddPlaceButton";
import MapControls from "@/features/map-explorer/components/MapControls";

interface MapToolbarProps {
  placing: boolean;
  onTogglePlacing: () => void;
  showNames: boolean;
  onToggleNames: () => void;
  enabledTypes: Record<PoiType, boolean>;
  onToggleType: (type: PoiType) => void;
  showCustom: boolean;
  onToggleCustom: () => void;
}

export default function MapToolbar({
  placing,
  onTogglePlacing,
  showNames,
  onToggleNames,
  enabledTypes,
  onToggleType,
  showCustom,
  onToggleCustom,
}: MapToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-1000 flex items-start gap-2">
      <AddPlaceButton active={placing} onToggle={onTogglePlacing} />
      <MapControls
        showNames={showNames}
        onToggleNames={onToggleNames}
        enabledTypes={enabledTypes}
        onToggleType={onToggleType}
        showCustom={showCustom}
        onToggleCustom={onToggleCustom}
      />
    </div>
  );
}
