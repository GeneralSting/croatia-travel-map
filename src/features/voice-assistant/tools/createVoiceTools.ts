import type { z } from "zod";
import type {
  City,
  County,
  MapControlStoreApi,
  POIDataMap,
  POIUpdate,
} from "@/features/map-explorer";
import { buildPlaceIndex, resolvePlace, searchPlaces, type Place } from "./places";
import {
  COUNTY_NAME_HR,
  REGION_ALIASES,
  REGIONS,
  regionOfCounty,
  type RegionId,
} from "./regions";
import {
  addToWishlistSchema,
  countyIdSchema,
  emptySchema,
  placeIdSchema,
  placeIdsSchema,
  searchPlacesSchema,
} from "./schemas";
import { fullMatch, normalizeText } from "./text";

/**
 * The client tools the ElevenLabs agent can call, as plain functions over the app's real data
 *
 * Contract with the agent (mirrored in its system prompt):
 *  - every result is a JSON string (the SDK only passes strings/numbers back to the agent)
 *  - success: { ok: true, ... }; failure: { ok: false, error, message } where `message` tells the
 *    agent how to recover (e.g. "call search_places first") instead of leaving it to guess
 *  - a tool never throws: an exception would surface to the agent as a vague failure
 *
 * Pure apart from the injected store and updatePoi, so every rule is unit-tested without React,
 * the SDK or Leaflet
 */

export const VOICE_TOOL_NAMES = [
  "search_places",
  "get_user_progress",
  "show_place",
  "focus_county",
  "highlight_places",
  "add_to_wishlist",
] as const;

export type VoiceToolName = (typeof VOICE_TOOL_NAMES)[number];
export type VoiceToolHandler = (params: Record<string, unknown>) => string;

export interface VoiceToolDeps {
  cities: City[];
  pois: Parameters<typeof buildPlaceIndex>[1];
  counties: County[];
  store: MapControlStoreApi;
  signedIn: boolean;
  poiDataMap: POIDataMap;
  countyPercents: Record<string, number>;
  updatePoi: (poiId: string, data: POIUpdate) => void;
}

const LIST_LIMIT = 15; // cap on lists returned to the agent - long results cost tokens and latency
const DESCRIPTION_MAX = 110;

const ok = (data: Record<string, unknown> = {}) => JSON.stringify({ ok: true, ...data });
const fail = (error: string, message: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ ok: false, error, message, ...extra });

function invalidParams(error: z.ZodError) {
  return fail(
    "invalid_parameters",
    "Some parameters were invalid. Fix them and call the tool again.",
    { details: error.issues.map((issue) => `${issue.path.join(".") || "params"}: ${issue.message}`) },
  );
}

const shorten = (text: string) =>
  text.length > DESCRIPTION_MAX ? `${text.slice(0, DESCRIPTION_MAX - 1)}…` : text;

export function createVoiceTools(deps: VoiceToolDeps): Record<VoiceToolName, VoiceToolHandler> {
  const places = buildPlaceIndex(deps.cities, deps.pois);
  const countyById = new Map(deps.counties.map((county) => [county.id, county]));
  const countyName = (id: string) => COUNTY_NAME_HR[id] ?? countyById.get(id)?.name ?? id;
  const getState = () => deps.store.getState();

  // The compact shape every place is reported in
  const describe = (place: Place) => {
    const status = place.kind === "poi" ? deps.poiDataMap[place.id]?.status : undefined;
    const region = regionOfCounty(place.countyId);
    return {
      id: place.id,
      name: place.name,
      kind: place.kind,
      type: place.type,
      county: countyName(place.countyId),
      region: region ? REGIONS[region].label : undefined,
      ...(status && status !== "not_visited" ? { status } : {}),
      ...(place.mine ? { mine: true } : {}),
      ...(place.description ? { description: shorten(place.description) } : {}),
    };
  };

  const unknownPlace = (idOrName: string) =>
    fail(
      "unknown_place",
      `No place "${idOrName}" in the app's data. Call search_places first and use an id from its results - never guess ids.`,
    );

  // A county by id or name (English or Croatian); null when it isn't a single county
  function resolveCounty(idOrName: string): County | null {
    const exact = countyById.get(idOrName);
    if (exact) return exact;
    return (
      deps.counties.find(
        (county) =>
          fullMatch(county.name, idOrName) || fullMatch(COUNTY_NAME_HR[county.id] ?? "", idOrName),
      ) ?? null
    );
  }

  const regionAlias = (text: string): RegionId | undefined => REGION_ALIASES[normalizeText(text)];

  // Each handler: validate -> act -> compact JSON. Wrapped once below so none can throw
  const handlers: Record<VoiceToolName, VoiceToolHandler> = {
    search_places(params) {
      const parsed = searchPlacesSchema.safeParse(params);
      if (!parsed.success) return invalidParams(parsed.error);
      const { query, county, category, near, radiusKm, limit } = parsed.data;
      let region = parsed.data.region;

      let countyIds: string[] | undefined;
      if (county) {
        const aliased = regionAlias(county);
        if (aliased) region = aliased; // "Slavonija" is a region, not the county Požega-Slavonia
        else {
          const match = resolveCounty(county);
          if (!match) {
            return fail(
              "unknown_county",
              `No county "${county}". For a broad area use the region parameter instead.`,
              { regions: Object.keys(REGIONS) },
            );
          }
          countyIds = [match.id];
        }
      }

      let nearCriteria;
      if (near) {
        const origin = resolvePlace(places, near);
        if (!origin) return unknownPlace(near);
        if (origin.lat == null || origin.lng == null) {
          return fail("no_location", `"${origin.name}" has no map position to search around.`);
        }
        nearCriteria = { lat: origin.lat, lng: origin.lng, excludeId: origin.id, radiusKm };
      }

      const { total, hits } = searchPlaces(places, {
        query,
        countyIds,
        region,
        category,
        near: nearCriteria,
        limit,
      });

      return ok({
        total_matches: total,
        results: hits.map(({ place, distanceKm }) => ({
          ...describe(place),
          ...(distanceKm != null ? { distance_km: Math.round(distanceKm) } : {}),
        })),
        ...(total === 0
          ? { hint: "No matches. Try a shorter query, another spelling, or fewer filters." }
          : {}),
      });
    },

    get_user_progress(params) {
      const parsed = emptySchema.safeParse(params ?? {});
      if (!parsed.success) return invalidParams(parsed.error);
      if (!deps.signedIn) {
        return fail(
          "not_signed_in",
          "The user is not signed in, so there is no saved progress. Suggest signing in to track places.",
        );
      }

      const poiPlaces = places.filter((place) => place.kind === "poi");
      const withStatus = (status: "visited" | "want_to_visit") =>
        poiPlaces.filter((place) => deps.poiDataMap[place.id]?.status === status);
      const visited = withStatus("visited");
      const wishlist = withStatus("want_to_visit");

      const countySummary = deps.counties.map((county) => ({
        id: county.id,
        name: countyName(county.id),
        region: regionOfCounty(county.id),
        explored_percent: deps.countyPercents[county.id] ?? 0,
      }));

      return ok({
        totals: { visited: visited.length, want_to_visit: wishlist.length },
        regions: Object.entries(REGIONS)
          .filter(([id]) => id !== "obala")
          .map(([id, region]) => ({
            region: id,
            label: region.label,
            counties: countySummary
              .filter((county) => county.region === id)
              .map(({ id: countyId, name, explored_percent }) => ({
                id: countyId,
                name,
                explored_percent,
              })),
          })),
        not_started_counties: countySummary
          .filter((county) => county.explored_percent === 0)
          .map((county) => county.name),
        wishlist: wishlist.slice(0, LIST_LIMIT).map((place) => ({
          id: place.id,
          name: place.name,
          county: countyName(place.countyId),
        })),
        recently_visited: visited.slice(0, LIST_LIMIT).map((place) => ({
          id: place.id,
          name: place.name,
          county: countyName(place.countyId),
        })),
      });
    },

    show_place(params) {
      const parsed = placeIdSchema.safeParse(params);
      if (!parsed.success) return invalidParams(parsed.error);
      const place = resolvePlace(places, parsed.data.placeId);
      if (!place) return unknownPlace(parsed.data.placeId);

      if (place.kind === "city" || (place.ownCoordinates && place.lat != null && place.lng != null)) {
        const target = { id: place.id, countyId: place.countyId, lat: place.lat!, lng: place.lng! };
        if (place.kind === "city") getState().showCity(target);
        else getState().showPoi(target);
        return ok({ shown: describe(place) });
      }

      // A city's place without its own pin: open the city it belongs to, where it is listed
      const parent = place.cityId ? places.find((p) => p.id === place.cityId) : undefined;
      if (parent && parent.lat != null && parent.lng != null) {
        getState().showCity({
          id: parent.id,
          countyId: parent.countyId,
          lat: parent.lat!,
          lng: parent.lng!,
        });
        getState().highlightPlaces([parent.id]);
        return ok({
          shown: describe(place),
          note: `It has no pin of its own; the city panel of ${parent.name}, where it is listed, was opened.`,
        });
      }

      getState().focusCounty(place.countyId);
      return ok({
        shown: describe(place),
        note: "It has no exact map position; its county was opened instead.",
      });
    },

    focus_county(params) {
      const parsed = countyIdSchema.safeParse(params);
      if (!parsed.success) return invalidParams(parsed.error);
      const { countyId } = parsed.data;

      if (regionAlias(countyId)) {
        return fail(
          "is_region",
          `"${countyId}" is a region, not a county. Use search_places with region, or highlight_places.`,
        );
      }
      const county = resolveCounty(countyId);
      if (!county) {
        return fail("unknown_county", `No county "${countyId}".`, {
          counties: deps.counties.map((c) => c.id),
        });
      }

      getState().focusCounty(county.id);
      const region = regionOfCounty(county.id);
      return ok({
        county: { id: county.id, name: countyName(county.id) },
        region: region ? REGIONS[region].label : undefined,
        ...(deps.signedIn ? { explored_percent: deps.countyPercents[county.id] ?? 0 } : {}),
        cities: places
          .filter((place) => place.kind === "city" && place.countyId === county.id)
          .sort((a, b) => a.importance - b.importance)
          .slice(0, 6)
          .map((city) => city.name),
        place_count: places.filter((p) => p.kind === "poi" && p.countyId === county.id).length,
      });
    },

    highlight_places(params) {
      const parsed = placeIdsSchema.safeParse(params);
      if (!parsed.success) return invalidParams(parsed.error);
      const { placeIds } = parsed.data;

      if (!placeIds.length) {
        getState().clearHighlights();
        return ok({ cleared: true });
      }

      const found: Place[] = [];
      const unknown: string[] = [];
      for (const id of placeIds) {
        const place = resolvePlace(places, id);
        if (place) found.push(place);
        else unknown.push(id);
      }
      if (!found.length) return unknownPlace(unknown.join(", "));

      // A place without its own pin is represented on the map by its city's pin
      const pinIds = [...new Set(found.map((p) => (p.ownCoordinates ? p.id : (p.cityId ?? p.id))))];
      const points = found
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => [p.lat!, p.lng!] as [number, number]);

      getState().highlightPlaces(pinIds);
      getState().fitPoints(points);
      return ok({
        highlighted: found.map((place) => place.name),
        ...(unknown.length
          ? { unknown, message: "Some ids were not found - use ids from search_places." }
          : {}),
      });
    },

    add_to_wishlist(params) {
      const parsed = addToWishlistSchema.safeParse(params);
      if (!parsed.success) return invalidParams(parsed.error);
      const place = resolvePlace(places, parsed.data.placeId);
      if (!place) return unknownPlace(parsed.data.placeId);

      if (!parsed.data.confirmed) {
        return fail(
          "confirmation_required",
          `Ask the user whether to add "${place.name}" to their wishlist. Only after a clear yes, call again with confirmed=true.`,
        );
      }
      if (!deps.signedIn) {
        return fail("not_signed_in", "The user must sign in to keep a wishlist.");
      }
      if (place.kind === "city") {
        return fail(
          "not_a_place",
          `${place.name} is a city; the wishlist holds places. Offer one of its places instead.`,
          {
            city_places: places
              .filter((p) => p.kind === "poi" && p.cityId === place.id)
              .slice(0, 6)
              .map((p) => ({ id: p.id, name: p.name })),
          },
        );
      }

      const current = deps.poiDataMap[place.id];
      if (current?.status === "visited") {
        return fail(
          "already_visited",
          `The user has already visited ${place.name}; it was left unchanged.`,
        );
      }
      if (current?.status === "want_to_visit") {
        return ok({ status: "already_on_wishlist", place: describe(place) });
      }

      // Keep any rating/notes the user already saved - only the status changes
      deps.updatePoi(place.id, { ...current, status: "want_to_visit" });
      return ok({ status: "added", place: describe(place) });
    },
  };

  // The safety net: an unexpected exception becomes a normal failure result, never a throw
  return Object.fromEntries(
    VOICE_TOOL_NAMES.map((name) => [
      name,
      (params: Record<string, unknown>) => {
        try {
          return handlers[name](params ?? {});
        } catch {
          return fail("internal_error", "The app could not complete this action. Try once more.");
        }
      },
    ]),
  ) as Record<VoiceToolName, VoiceToolHandler>;
}
