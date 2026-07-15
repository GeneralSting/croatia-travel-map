"use client";

// Persistence for a visitor's travel progress, with three modes:
//   1. Supabase NOT configured  → localStorage (the original "user agnostic" behavior).
//   2. Supabase configured, signed out → read-only; editing redirects to /login.
//   3. Supabase configured, signed in  → per-user Postgres via TanStack Query (cached).
// The record shapes returned here match what the panels already expect.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
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

interface PoiRow {
  poi_id: string;
  status: POIStatus;
  rating: number | null;
  date_visited: string | null;
  notes: string | null;
}
interface CountyRow {
  county_id: string;
  visited_percent: number | null;
  is_manual: boolean;
}

export function useTravelData() {
  const { user, configured } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Mode 1: localStorage (only while Supabase is not configured) ──────────
  const [localPoi, setLocalPoi] = useState<POIDataMap>({});
  const [localCounty, setLocalCounty] = useState<CountyDataMap>({});
  const [localLoaded, setLocalLoaded] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    setLocalPoi(load<POIDataMap>(POI_KEY) ?? {});
    setLocalCounty(load<CountyDataMap>(COUNTY_KEY) ?? {});
    setLocalLoaded(true);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured || !localLoaded) return;
    try {
      localStorage.setItem(POI_KEY, JSON.stringify(localPoi));
    } catch {
      /* ignore */
    }
  }, [localPoi, localLoaded]);

  useEffect(() => {
    if (isSupabaseConfigured || !localLoaded) return;
    try {
      localStorage.setItem(COUNTY_KEY, JSON.stringify(localCounty));
    } catch {
      /* ignore */
    }
  }, [localCounty, localLoaded]);

  // ── Modes 2/3: Supabase (fetch this user's rows; cached by React Query) ────
  const enabled = configured && !!user;
  const uid = user?.id;

  const poiQuery = useQuery({
    queryKey: ["poi_progress", uid],
    enabled,
    queryFn: async (): Promise<PoiRow[]> => {
      const { data, error } = await createClient()
        .from("poi_progress")
        .select("poi_id,status,rating,date_visited,notes")
        .eq("user_id", uid!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const countyQuery = useQuery({
    queryKey: ["county_overrides", uid],
    enabled,
    queryFn: async (): Promise<CountyRow[]> => {
      const { data, error } = await createClient()
        .from("county_overrides")
        .select("county_id,visited_percent,is_manual")
        .eq("user_id", uid!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const poiMutation = useMutation({
    mutationFn: async ({ poiId, data }: { poiId: string; data: POIUpdate }) => {
      const { error } = await createClient().from("poi_progress").upsert({
        user_id: uid!,
        poi_id: poiId,
        status: data.status,
        rating: data.rating ?? null,
        date_visited: data.date_visited || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["poi_progress", uid] }),
  });

  const countyMutation = useMutation({
    mutationFn: async ({
      countyId,
      percent,
      isManual,
    }: {
      countyId: string;
      percent: number;
      isManual: boolean;
    }) => {
      const { error } = await createClient().from("county_overrides").upsert({
        user_id: uid!,
        county_id: countyId,
        visited_percent: percent,
        is_manual: isManual,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["county_overrides", uid] }),
  });

  // ── Derive the maps the UI consumes ───────────────────────────────────────
  const dbPoiMap = useMemo<POIDataMap>(() => {
    const map: POIDataMap = {};
    for (const r of poiQuery.data ?? []) {
      map[r.poi_id] = {
        status: r.status,
        rating: r.rating,
        date_visited: r.date_visited,
        notes: r.notes,
      };
    }
    return map;
  }, [poiQuery.data]);

  const dbCountyMap = useMemo<CountyDataMap>(() => {
    const map: CountyDataMap = {};
    for (const r of countyQuery.data ?? []) {
      map[r.county_id] = {
        visited_percent: r.visited_percent,
        is_manual_override: r.is_manual,
      };
    }
    return map;
  }, [countyQuery.data]);

  const poiDataMap = isSupabaseConfigured ? dbPoiMap : localPoi;
  const countyDataMap = isSupabaseConfigured ? dbCountyMap : localCounty;

  // The map itself only needs geometry to render; progress fills in when it arrives.
  const loaded = isSupabaseConfigured ? true : localLoaded;
  const canEdit = configured ? !!user : true;

  const updatePOI = useCallback(
    (poiId: string, data: POIUpdate) => {
      if (!isSupabaseConfigured) {
        setLocalPoi((prev) => ({
          ...prev,
          [poiId]: {
            status: data.status,
            rating: data.rating ?? null,
            date_visited: data.date_visited ?? null,
            notes: data.notes ?? null,
          },
        }));
        return;
      }
      if (!user) {
        router.push("/login");
        return;
      }
      poiMutation.mutate({ poiId, data });
    },
    [user, poiMutation, router],
  );

  const setCountyOverride = useCallback(
    (countyId: string, percent: number, isManual: boolean) => {
      if (!isSupabaseConfigured) {
        setLocalCounty((prev) => ({
          ...prev,
          [countyId]: { visited_percent: percent, is_manual_override: isManual },
        }));
        return;
      }
      if (!user) {
        router.push("/login");
        return;
      }
      countyMutation.mutate({ countyId, percent, isManual });
    },
    [user, countyMutation, router],
  );

  return {
    poiDataMap,
    countyDataMap,
    loaded,
    canEdit,
    updatePOI,
    setCountyOverride,
  };
}
