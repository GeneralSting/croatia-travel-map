"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/lib/supabase/database.types";
import type { NewUserPoi, POI } from "@/features/map-explorer/types/types";
import { newId } from "../utils/helpers";

/**
 * Custom POI writes for the signed-in user, kept next to the ["pois", uid] query they mutate
 * Both mutations update the cache optimistically (show/remove the pin immadiately) and reconcile
 * with the server on settle
 * Exposes two imperative callbacks the provider hands to consumer
 */
export function useCustomPoiMutations(uid: string | undefined) {
  const queryClient = useQueryClient();
  const poisKey = ["pois", uid];

  const addUserPoiMutation = useMutation({
    mutationFn: async (poi: POI) => {
      const row: TablesInsert<"pois"> = {
        id: poi.id,
        owner_id: poi.owner_id,
        county_id: poi.county_id,
        city_id: null,
        name: poi.name,
        type: poi.type,
        description: poi.description || null,
        lat: poi.lat,
        lng: poi.lng,
      };

      const { error } = await createClient().from("pois").insert(row);
      if (error) throw error;
    },

    // Show the new pin immediately, then reconcile with the server
    onMutate: async (poi: POI) => {
      await queryClient.cancelQueries({ queryKey: poisKey });
      const previous = queryClient.getQueryData<POI[]>(poisKey);
      queryClient.setQueryData<POI[]>(poisKey, (old) => [...(old ?? []), poi]);
      return { previous };
    },

    onError: (_error, _poi, context) => {
      if (context?.previous)
        queryClient.setQueryData(poisKey, context.previous);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: poisKey }),
  });

  const deleteUserPoiMutation = useMutation({
    mutationFn: async (poiId: string) => {
      // DB cascades poi_progress rows for this POI (FK on delete cascade)
      const { error } = await createClient()
        .from("pois")
        .delete()
        .eq("id", poiId)
        .eq("owner_id", uid!);
      if (error) throw error;
    },

    onMutate: async (poiId: string) => {
      await queryClient.cancelQueries({ queryKey: poisKey });
      const previous = queryClient.getQueryData<POI[]>(poisKey);
      queryClient.setQueryData<POI[]>(poisKey, (old) =>
        (old ?? []).filter((poi) => poi.id !== poiId),
      );
      return { previous };
    },

    onError: (_error, _poiId, context) => {
      if (context?.previous)
        queryClient.setQueryData(poisKey, context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: poisKey });
      queryClient.invalidateQueries({ queryKey: ["poi_progress", uid] });
    },
  });

  const addCustomPoi = useCallback(
    (input: NewUserPoi): POI | null => {
      if (!uid) return null;
      const poi: POI = {
        id: newId(),
        owner_id: uid,
        county_id: input.county_id,
        city_id: null,
        name: input.name,
        type: input.type,
        description: input.description ?? "",
        lat: input.lat,
        lng: input.lng,
      };

      addUserPoiMutation.mutate(poi);
      return poi;
    },
    [uid, addUserPoiMutation],
  );

  const deleteCustomPoi = useCallback(
    (poiId: string) => {
      if (!uid) return;
      deleteUserPoiMutation.mutate(poiId);
    },
    [uid, deleteUserPoiMutation],
  );

  return { addCustomPoi, deleteCustomPoi };
}
