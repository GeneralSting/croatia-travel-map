// Domain types for the Croatia Explorer map feature. Pure type declarations — no runtime.

export type PoiType =
  | "city"
  | "mountain"
  | "lake"
  | "river"
  | "national_park"
  | "nature"
  | "island"
  | "campsite"
  | "landmark";

export type POIStatus = "not_visited" | "want_to_visit" | "visited";

export interface County {
  id: string;
  name: string;
  color: string;
}

export interface POI {
  id: string;
  county_id: string;
  name: string;
  type: PoiType;
  description: string;
  /** Map position. Seed POIs get these from poiCoords.ts; a POI is only drawn once it has both. */
  lat?: number;
  lng?: number;
}

/**
 * A place a signed-in user adds themselves (private to them). Same shape the panels/markers
 * expect from a POI, but coordinates are always present (the user drops the pin on the map).
 */
export interface UserPoi {
  id: string;
  county_id: string;
  name: string;
  type: PoiType;
  description?: string;
  lat: number;
  lng: number;
}

/** A user's saved progress for a single POI (browser-local). */
export interface POIRecord {
  status: POIStatus;
  rating?: number | null;
  date_visited?: string | null;
  notes?: string | null;
}

/** A user's optional manual override for a county's explored percentage. */
export interface CountyRecord {
  visited_percent?: number | null;
  is_manual_override?: boolean;
}

export type POIDataMap = Record<string, POIRecord | undefined>;
export type CountyDataMap = Record<string, CountyRecord | undefined>;

/**
 * Notable mountain peaks with real coordinates, drawn on the map as clickable ⛰️ POI pins
 * (see `mountainPois`). The county is the one each point falls in.
 */
export interface PlaceMarker {
  id: string;
  name: string;
  county_id: string;
  lat: number;
  lng: number;
}

/** 1 = major (always visible), 2 = regional, 3 = smaller town (only when zoomed in). */
export type CityImportance = 1 | 2 | 3;

export interface City {
  id: string;
  name: string;
  county_id: string;
  lat: number;
  lng: number;
  importance: CityImportance;
  description: string;
  /** Cover photo; defaults to `/cities/<id>.jpg` (see `cityCover`). */
  coverImage?: string;
}
