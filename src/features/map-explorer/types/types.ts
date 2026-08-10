// Domain types for the Croatia Explorer map feature, pure type declarations - no runtime
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
}

export interface POI {
  id: string;
  owner_id: string | null; // null - shared default POI, containing user ID means thats the user's custom POI
  county_id: string;
  city_id: string | null; // set when the POI belongs to a city (shown in the city drawer, not as a map pin)
  name: string;
  type: PoiType;
  description: string;
  // Map position, POI is only drawn as a pin once it has both (custom POIs always do)
  lat?: number | null;
  lng?: number | null;
}

// Fields a signed-in user supplies when adding their own place (ID + owner are set on insert)
export interface NewUserPoi {
  county_id: string;
  name: string;
  type: PoiType;
  description?: string;
  lat: number;
  lng: number;
}

// user's saved progress for a single POI
export interface POIRecord {
  status: POIStatus;
  rating?: number | null;
  date_visited?: string | null;
  notes?: string | null;
}

export type POIUpdate = POIRecord;

// user's optional manual override for a county's explored percentage
export interface CountyRecord {
  visited_percent?: number | null;
  is_manual_override?: boolean;
}

export type POIDataMap = Record<string, POIRecord | undefined>;
export type CountyDataMap = Record<string, CountyRecord | undefined>;

//
/**
 * 1 = major (always visible)
 * 2 = regional
 * 3 = smaller town (only when zoomed in)
 */
export type CityImportance = 1 | 2 | 3;

export interface City {
  id: string;
  name: string;
  county_id: string;
  lat: number;
  lng: number;
  importance: CityImportance;
  description: string;
  coverImage?: string; // conver photo; defaults to '/cities/<id>.jpg' (see 'cityCover')
}

// presentation for a POI type - the label comes from the DB, the icon/color from the frontend
export interface PoiTypeMeta {
  label: string;
  icon: string;
  color: string;
}

export interface PoiTypeRow {
  id: PoiType;
  label: string;
  sort_order: number;
}

export type PanelView =
  | { kind: "county"; countyId: string }
  | { kind: "city"; cityId: string; countyId: string }
  | { kind: "poi"; poiId: string; countyId: string };

export type Placing =
  | { status: "picking" }
  | { status: "form"; lat: number; lng: number };
