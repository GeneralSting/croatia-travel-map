"use client";

// The right-hand panel router: a county overview, a drilled-in city view, or a single POI's
// detail — whichever the current navigation view points at.

import type {
  CountyDataMap,
  POI,
  POIDataMap,
} from "@/features/map-explorer/types/types";
import type { PanelView } from "@/features/map-explorer/hooks/useMapNavigation";
import type { POIUpdate } from "@/features/map-explorer/hooks/useTravelData";
import CountyPanel from "./CountyPanel";
import CityPanel from "./CityPanel";
import PoiPanel from "./PoiPanel";

interface MapPanelsProps {
  view: PanelView;
  activePoi: POI | null;
  activePoiIsUser: boolean;
  poiDataMap: POIDataMap;
  countyDataMap: CountyDataMap;
  onClose: () => void;
  onCitySelect: (cityId: string) => void;
  onPoiSelect: (poiId: string) => void;
  onCityBack: () => void;
  onPOIUpdate: (poiId: string, data: POIUpdate) => void | Promise<void>;
  onCountyOverride: (
    countyId: string,
    percent: number,
    isManual: boolean,
  ) => void;
  onDeletePoi: (poiId: string) => void;
}

export default function MapPanels({
  view,
  activePoi,
  activePoiIsUser,
  poiDataMap,
  countyDataMap,
  onClose,
  onCitySelect,
  onPoiSelect,
  onCityBack,
  onPOIUpdate,
  onCountyOverride,
  onDeletePoi,
}: MapPanelsProps) {
  return (
    <div className="w-full sm:w-96 shrink-0 h-full overflow-hidden shadow-2xl animate-slide-in">
      {view.kind === "county" && (
        <CountyPanel
          countyId={view.countyId}
          poiDataMap={poiDataMap}
          countyDataMap={countyDataMap}
          onClose={onClose}
          onCitySelect={onCitySelect}
          onPoiSelect={onPoiSelect}
          onPOIUpdate={onPOIUpdate}
          onCountyOverride={onCountyOverride}
        />
      )}
      {view.kind === "city" && (
        <CityPanel
          cityId={view.cityId}
          poiDataMap={poiDataMap}
          onClose={onClose}
          onBack={onCityBack}
          onPOIUpdate={onPOIUpdate}
        />
      )}
      {view.kind === "poi" && activePoi && (
        <PoiPanel
          poi={activePoi}
          userData={poiDataMap[activePoi.id]}
          onUpdate={onPOIUpdate}
          onClose={onClose}
          onDelete={
            activePoiIsUser ? () => onDeletePoi(activePoi.id) : undefined
          }
        />
      )}
    </div>
  );
}
