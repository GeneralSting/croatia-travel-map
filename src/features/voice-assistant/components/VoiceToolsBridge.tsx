"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  useConversationClientTool,
  useConversationControls,
  useConversationStatus,
} from "@elevenlabs/react";
import { useAuth } from "@/features/auth-portal";
import {
  computeCountyPercents,
  useMapControlApi,
  useMapData,
  useTravelData,
} from "@/features/map-explorer";
import { createVoiceTools } from "@/features/voice-assistant/tools/createVoiceTools";
import { describeMapView } from "@/features/voice-assistant/tools/mapContext";

/**
 * Connects the agent to the map. Renders nothing; it sits inside both the SDK's ConversationProvider
 * and the map's providers (it's rendered as a child of <MapApp>), so it can reach both sides:
 *  1. registers the client tools - the agent calls them, they read the real data and drive the map
 *  2. tells the agent (sendContextualUpdate) when the *user* opens something on the map
 *
 * useConversationClientTool always calls the latest handler, so the tools see fresh data and
 * progress without re-registering. Tool names must match the agent's dashboard definitions exactly
 */
export default function VoiceToolsBridge() {
  const { user } = useAuth();
  const { counties, cities, pois, getCounty, getCity, getPoi, getVisitedPercent } = useMapData();
  const { poiDataMap, countyDataMap, updatePOI } = useTravelData(); // same React Query cache as the map
  const store = useMapControlApi();
  const { sendContextualUpdate } = useConversationControls();
  const { status } = useConversationStatus();

  const tools = useMemo(
    () =>
      createVoiceTools({
        cities,
        pois,
        counties,
        store,
        signedIn: !!user,
        poiDataMap,
        countyPercents: computeCountyPercents(
          counties,
          poiDataMap,
          countyDataMap,
          getVisitedPercent,
        ),
        updatePoi: updatePOI,
      }),
    [cities, pois, counties, store, user, poiDataMap, countyDataMap, getVisitedPercent, updatePOI],
  );

  // Hooks can't be called in a loop, so each tool is registered on its own line
  useConversationClientTool("search_places", (params) => tools.search_places(params));
  useConversationClientTool("get_user_progress", (params) => tools.get_user_progress(params));
  useConversationClientTool("show_place", (params) => tools.show_place(params));
  useConversationClientTool("focus_county", (params) => tools.focus_county(params));
  useConversationClientTool("highlight_places", (params) => tools.highlight_places(params));
  useConversationClientTool("add_to_wishlist", (params) => tools.add_to_wishlist(params));

  // Latest values for the store subscription below, without re-subscribing on every change
  const latest = useRef({ status, getCounty, getCity, getPoi, sendContextualUpdate });
  useEffect(() => {
    latest.current = { status, getCounty, getCity, getPoi, sendContextualUpdate };
  });

  /**
   * Only the user's own navigation is reported: the store marks every view change with its source,
   * so what the agent itself just showed (viewSource "api") isn't echoed back to it
   */
  useEffect(
    () =>
      store.subscribe((state, previous) => {
        if (state.view === previous.view || state.viewSource !== "user") return;
        const current = latest.current;
        if (current.status !== "connected") return;
        const note = describeMapView(state.view, current);
        if (note) current.sendContextualUpdate(note);
      }),
    [store],
  );

  return null;
}
