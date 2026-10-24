import { useContext } from "react";
import {
  MapDataContext,
  type MapData,
} from "@/features/map-explorer/components/MapDataProvider";

// access the fetched reference data + lookups - must be used within "<MapDataProvider>"
export function useMapData(): MapData {
  const value = useContext(MapDataContext);
  if (!value) {
    throw new Error("useMapData must be used within a MapDataProvider");
  }
  return value;
}
