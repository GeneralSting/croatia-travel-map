"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AUTH_PATHS } from "@/lib/data";
import { useAuth } from "@/features/auth-portal";
import type {
  CountyDataMap,
  POIDataMap,
  POIStatus,
  POIUpdate,
} from "@/features/map-explorer/types/types";

/**
 * Per-user travel progress backed by Supabase Postgres
 * Reference data (POIs/counties/cities) comes from MapDataProvider; custom POI create/delete live there
 * This hook owns only the user's saved progress and county overrides
 *  - Signed out (guest): read-only; editing redirects to /login
 *  - Signed in: per-user rows, cached by React Query
 */
export function useTravelData() {
  const { user, configured } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const enabled = isSupabaseConfigured && configured && !!user;
  const uid = user?.id;

  const poiQuery = useQuery({
    queryKey: ["poi_progress", uid],
    enabled,
    queryFn: async () => {
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
    queryFn: async () => {
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
      const { error } = await createClient()
        .from("poi_progress")
        .upsert({
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

  const poiDataMap = useMemo<POIDataMap>(() => {
    const map: POIDataMap = {};
    for (const row of poiQuery.data ?? []) {
      map[row.poi_id] = {
        status: row.status as POIStatus, // plain text column (its check isn't reflected in the generated type)
        rating: row.rating,
        date_visited: row.date_visited,
        notes: row.notes,
      };
    }
    return map;
  }, [poiQuery.data]);

  const countyDataMap = useMemo<CountyDataMap>(() => {
    const map: CountyDataMap = {};
    for (const row of countyQuery.data ?? []) {
      map[row.county_id] = {
        visited_percent: row.visited_percent,
        is_manual_override: row.is_manual,
      };
    }
    return map;
  }, [countyQuery.data]);

  // Nothing to load for guests; signed-in users wait for both queries.
  const loaded = !enabled || (poiQuery.isSuccess && countyQuery.isSuccess);

  const updatePOI = useCallback(
    (poiId: string, data: POIUpdate) => {
      if (!user) {
        router.push(AUTH_PATHS.LOGIN);
        return;
      }
      poiMutation.mutate({ poiId, data });
    },
    [user, poiMutation, router],
  );

  const setCountyOverride = useCallback(
    (countyId: string, percent: number, isManual: boolean) => {
      if (!user) {
        router.push(AUTH_PATHS.LOGIN);
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
    updatePOI,
    setCountyOverride,
  };
}
