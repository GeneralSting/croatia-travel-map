import { useCallback, useMemo, useRef } from "react";
import { useCroatiaGeoJson } from "../hooks/useCroatiaGeoJson";
import { useMapData } from "../hooks/useMapData";
import { useMapFilters } from "../hooks/useMapFilters";
import { useTravelData } from "../hooks/useTravelData";
import { useMapNavigation } from "../hooks/useMapNavigation";
import { usePlacement } from "../hooks/usePlacement";
import { SCREEN_BG } from "../constants/const";
import MapLoading from "./MapLoading";
import MapCanvas from "./MapCanvas";
import PlacementPill from "./PlacementPill";
import MapToolbar from "./MapToolbar";
import SummaryDrawer from "./panels/SummaryDrawer";
import MapPanels from "./panels/MapPanels";

export function CroatiaMapView() {
  /**
   * County/island click bubbles to the map click, so while placing a pin we must ignore navigation clicks
   * This ref, kept in sync by usePlacement lets the click handlers read the current placement state without being
   * re-created on every change which would rebind markers
   */
  const placingRef = useRef(false);

  const {
    referenceLoaded,
    counties,
    poiTypeOrder,
    getCity,
    getPoi,
    getVisitedPercent,
    addCustomPoi,
    deleteCustomPoi,
  } = useMapData();

  const { poiDataMap, countyDataMap, loaded, updatePOI, setCountyOverride } =
    useTravelData();

  const { geoJson, islands, outline } = useCroatiaGeoJson();

  const {
    showPoiNames,
    toggleNames,
    enabledTypes,
    toggleType,
    showCustom,
    toggleCustom,
  } = useMapFilters(poiTypeOrder);

  const nav = useMapNavigation({ getCity, getPoi, placingRef });

  const placement = usePlacement({
    placingRef,
    geoJson,
    islands,
    outline,
    counties,
    addCustomPoi,
    closePanel: nav.closePanel,
    onPlaced: nav.openPoiPanel,
  });

  // County visited percents (auto from POIs, or a manual override)
  const countyPercents = useMemo(() => {
    const result: Record<string, number> = {};
    counties.forEach((county) => {
      const record = countyDataMap[county.id];
      if (record?.is_manual_override && record?.visited_percent != null) {
        result[county.id] = record.visited_percent;
      } else {
        result[county.id] = getVisitedPercent(county.id, poiDataMap);
      }
    });
    return result;
  }, [counties, poiDataMap, countyDataMap, getVisitedPercent]);

  const handleDeletePoi = useCallback(
    (poiId: string) => {
      deleteCustomPoi(poiId);
      nav.closePanel();
    },
    [deleteCustomPoi, nav],
  );

  if (!referenceLoaded || !loaded || !geoJson) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: SCREEN_BG }}
      >
        <MapLoading />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 overflow-hidden">
      {/* Main content — the map fills the whole viewport; account/filters float over it. */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative transition-all duration-300">
          <MapCanvas
            geoJson={geoJson}
            islands={islands}
            countyPercents={countyPercents}
            showNames={showPoiNames}
            enabledTypes={enabledTypes}
            showCustom={showCustom}
            selectedCounty={nav.selectedCounty}
            selectedCity={nav.selectedCity}
            selectedPoi={nav.selectedPoi}
            onCountyClick={nav.openCounty}
            onCityClick={nav.openCity}
            onPoiClick={nav.openPoi}
            placing={placement.placing}
            onPlacePick={placement.handlePlacePick}
            onConfirmPlace={placement.handleConfirmPlace}
            onCancelPlace={placement.cancelPlacing}
          />

          <PlacementPill
            active={placement.placing?.status === "picking"}
            error={placement.placeError}
            onCancel={placement.cancelPlacing}
          />

          <MapToolbar
            placing={!!placement.placing}
            onTogglePlacing={() =>
              placement.placing
                ? placement.cancelPlacing()
                : placement.startPlacing()
            }
            showNames={showPoiNames}
            onToggleNames={toggleNames}
            enabledTypes={enabledTypes}
            onToggleType={toggleType}
            showCustom={showCustom}
            onToggleCustom={toggleCustom}
          />

          <SummaryDrawer
            poiDataMap={poiDataMap}
            countyPercents={countyPercents}
            onCountySelect={nav.openCounty}
          />
        </div>

        {nav.view && (
          <MapPanels
            view={nav.view}
            activePoi={nav.activePoi}
            activePoiIsUser={nav.activePoiIsUser}
            poiDataMap={poiDataMap}
            countyDataMap={countyDataMap}
            onClose={nav.closePanel}
            onCitySelect={nav.openCity}
            onPoiSelect={nav.openPoi}
            onCityBack={nav.goBackToCounty}
            onPOIUpdate={updatePOI}
            onCountyOverride={setCountyOverride}
            onDeletePoi={handleDeletePoi}
          />
        )}
      </div>
    </div>
  );
}
