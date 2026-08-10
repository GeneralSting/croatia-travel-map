import { createClient } from "@/lib/supabase/client";
import { POI_TYPE_STYLE } from "@/features/map-explorer/constants/const";
import type {
  City,
  CityImportance,
  County,
  POI,
  PoiType,
  PoiTypeMeta,
  PoiTypeRow,
} from "@/features/map-explorer/types/types";

/**
 * Reference-data reads and shaping for the map
 * Each function fetches one table with the browser Supabase client (reads governed by public-read / owner RLS)
 * and maps the raw rows into the app's domain types
 *
 * The client is typed with the generated `Database` (see lib/supabase/database.types.ts), so table
 * names, the columns inside each `.select(...)`, and the returned row shapes are all checked at
 * compile time
 */

export async function fetchCounties(): Promise<County[]> {
  const { data, error } = await createClient()
    .from("counties")
    .select("id,name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchCities(): Promise<City[]> {
  const { data, error } = await createClient()
    .from("cities")
    .select("id,county_id,name,lat,lng,importance,description,cover_image");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    county_id: row.county_id,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    importance: row.importance as CityImportance,
    description: row.description ?? "",
    coverImage: row.cover_image ?? undefined,
  }));
}

export async function fetchPoiTypes(): Promise<PoiTypeRow[]> {
  const { data, error } = await createClient()
    .from("poi_types")
    .select("id,label,sort_order")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as PoiTypeRow[];
}

export async function fetchPois(): Promise<POI[]> {
  const { data, error } = await createClient()
    .from("pois")
    .select("id,owner_id,county_id,city_id,name,type,description,lat,lng");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    owner_id: row.owner_id,
    county_id: row.county_id,
    city_id: row.city_id,
    name: row.name,
    type: row.type as PoiType,
    description: row.description ?? "",
    lat: row.lat,
    lng: row.lng,
  }));
}

/**
 * Merge DB poi_type rows (label + order) with the frontend icon/color styles, preserving the DB's sort order
 * Returns the meta map consumers read plus the ordered list of type values
 */
export function mergePoiTypes(rows: PoiTypeRow[]) {
  const poiTypes = {} as Record<PoiType, PoiTypeMeta>;
  const poiTypeOrder: PoiType[] = [];

  for (const row of rows) {
    const style = POI_TYPE_STYLE[row.id];
    poiTypes[row.id] = {
      label: row.label,
      icon: style?.icon ?? "",
      color: style?.color ?? "#64748B",
    };
    poiTypeOrder.push(row.id);
  }

  return { poiTypes, poiTypeOrder };
}
