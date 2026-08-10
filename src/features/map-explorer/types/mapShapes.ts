import { FeatureCollection } from "geojson";
import { Layer, PathOptions } from "leaflet";

export interface MapShapesProps {
  counties: FeatureCollection;
  islands: FeatureCollection | null;
  countyPercents: Record<string, number>;
  onCountyClick: (countyId: string) => void;
  selectedCounty: string | null;
}

export interface CountyProps {
  county_id: string;
  name: string;
}

export interface IslandProps {
  island_id: string;
  name: string;
  county_id: string;
}

// Leaflet path layers expose setStyle/bringToFront; the GeoJSON typings give us a base Layer
export type PathLayer = Layer & {
  setStyle: (style: PathOptions) => void;
  bringToFront: () => void;
};

export interface UseCountyLayersArgs {
  islands: FeatureCollection | null;
  countyPercents: Record<string, number>;
  selectedCounty: string | null;
  onCountyClick: (countyId: string) => void;
}
