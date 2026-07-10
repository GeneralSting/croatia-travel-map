"use client";

// Browser-local persistence for a visitor's travel progress. This replaces Base 44's
// per-user entity database: there are no accounts ("user agnostic"), each browser keeps
// its own data in localStorage. The record shapes here match exactly what the panels
// already expect (POIRecord / CountyRecord), so the UI components are untouched.

import { useCallback, useEffect, useState } from "react";
import type {
  CountyDataMap,
  POIDataMap,
  POIStatus,
} from "@/data/croatiaData";

const POI_KEY = "croatia-explorer:pois";
const COUNTY_KEY = "croatia-explorer:counties";

export interface POIUpdate {
  status: POIStatus;
  rating?: number | null;
  date_visited?: string | null;
  notes?: string | null;
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function useTravelData() {
  const [poiDataMap, setPoiDataMap] = useState<POIDataMap>({});
  const [countyDataMap, setCountyDataMap] = useState<CountyDataMap>({});
  const [loaded, setLoaded] = useState(false);

  // Hydrate once on mount (client only — localStorage isn't available on the server).
  useEffect(() => {
    setPoiDataMap(load<POIDataMap>(POI_KEY) ?? {});
    setCountyDataMap(load<CountyDataMap>(COUNTY_KEY) ?? {});
    setLoaded(true);
  }, []);

  // Persist after every change, but never overwrite storage before the initial hydrate.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(POI_KEY, JSON.stringify(poiDataMap));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [poiDataMap, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(COUNTY_KEY, JSON.stringify(countyDataMap));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [countyDataMap, loaded]);

  const updatePOI = useCallback((poiId: string, data: POIUpdate) => {
    setPoiDataMap((prev) => ({
      ...prev,
      [poiId]: {
        status: data.status,
        rating: data.rating ?? null,
        date_visited: data.date_visited ?? null,
        notes: data.notes ?? null,
      },
    }));
  }, []);

  const setCountyOverride = useCallback(
    (countyId: string, percent: number, isManual: boolean) => {
      setCountyDataMap((prev) => ({
        ...prev,
        [countyId]: { visited_percent: percent, is_manual_override: isManual },
      }));
    },
    [],
  );

  return { poiDataMap, countyDataMap, loaded, updatePOI, setCountyOverride };
}
