import type { City, County, POI } from "@/features/map-explorer";
import { COUNTY_NAME_HR } from "./regions";

type PanelView =
  | { kind: "county"; countyId: string }
  | { kind: "city"; cityId: string; countyId: string }
  | { kind: "poi"; poiId: string; countyId: string };

interface Lookups {
  getCounty(countyId: string): County | undefined;
  getCity(cityId: string): City | undefined;
  getPoi(poiId: string): POI | undefined;
}

/**
 * The background note sent to the agent when the *user* opens something on the map mid-conversation
 * (sendContextualUpdate: non-interrupting background information, not a user turn)
 * With it, "what's there to see?" right after clicking Split needs no city name
 * Written in English: it's an instruction-like note for the model, not text shown to anyone
 * https://elevenlabs.io/docs/agents-platform/customization/events/client-to-server-events
 */
export function describeMapView(view: PanelView | null, lookups: Lookups): string | null {
  if (!view) return null;

  const county = (id: string) => COUNTY_NAME_HR[id] ?? lookups.getCounty(id)?.name ?? id;

  if (view.kind === "county") {
    return `[map] The user opened the county ${county(view.countyId)} (id: ${view.countyId}) on the map.`;
  }
  if (view.kind === "city") {
    const city = lookups.getCity(view.cityId);
    if (!city) return null;
    return `[map] The user opened the city ${city.name} (id: ${city.id}, ${county(view.countyId)}) on the map.`;
  }
  const poi = lookups.getPoi(view.poiId);
  if (!poi) return null;
  return `[map] The user opened the place ${poi.name} (id: ${poi.id}, ${county(view.countyId)}) on the map.`;
}
