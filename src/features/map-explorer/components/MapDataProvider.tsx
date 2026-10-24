"use client";

import { createContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth-portal";
import { useCustomPoiMutations } from "@/features/map-explorer/hooks/useCustomPoiMutations";
import {
  fetchCities,
  fetchCounties,
  fetchPois,
  fetchPoiTypes,
  mergePoiTypes,
} from "@/features/map-explorer/utils/mapQueries";
import {
  citiesForCounty,
  countyDefaultPois,
  customPoisForCounty,
  looseCountyPois,
  mappablePois,
  percentVisited,
  poisForCity,
} from "@/features/map-explorer/utils/selectors";
import type {
  City,
  County,
  NewUserPoi,
  POI,
  POIDataMap,
  PoiType,
  PoiTypeMeta,
} from "@/features/map-explorer/types/types";

export interface MapData {
  referenceLoaded: boolean;
  counties: County[];
  cities: City[]; // all visible POIs - shared defaults and the current user's custom ones
  pois: POI[];
  poiTypes: Record<PoiType, PoiTypeMeta>; // type value - { label (DB), icon + color (frontend) } in the DB's sort order
  poiTypeOrder: PoiType[];

  getCounty(countyId: string): County | undefined;
  countyName(countyId: string): string;
  getCity(cityId: string): City | undefined;
  getPoi(poiId: string): POI | undefined;

  mappablePois(): POI[]; // POIs drawn as pins: have coordinates and aren't attached to a city
  poisForCity(cityId: string): POI[]; // city's "place to visit" list
  looseCountyPois(countyId: string): POI[]; // default county POIs, not tied to a city
  customPoisForCounty(countyId: string): POI[]; // user's own custom POIs within a county
  citiesForCounty(countyId: string): City[]; // cities inside a county, major first
  getVisitedPercent(countyId: string, poiDataMap: POIDataMap): number; // county explored percentage from its default POIs
  getCityPercent(cityId: string, poiDataMap: POIDataMap): number; // city explored percentage from its places to visit

  addCustomPoi(input: NewUserPoi): POI | null; // create a custom POI for the signed-in user; returns it (with its ID) or null when signed out
  deleteCustomPoi(poiId: string): void; // delete one of the user's own custom POIs (and its saved progress, via DB cascade)
}

/**
 * Single source of the map's reference data, fetched from Supabase (counties, cities, POIs, POI types)
 * and exposed via 'useMapData()'
 * POIs are unified - one query returns the shared defaults (owner_id null) and the signed-in user's custom POIs
 * (RLS does the filtering), so everything arrives togheter
 */
export const MapDataContext = createContext<MapData | null>(null);

export function MapDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id;

  const countiesQuery = useQuery({
    queryKey: ["counties"],
    queryFn: fetchCounties,
  });
  const citiesQuery = useQuery({ queryKey: ["cities"], queryFn: fetchCities });

  const poiTypesQuery = useQuery({
    queryKey: ["poi_types"],
    queryFn: fetchPoiTypes,
  });
  const poisQuery = useQuery({ queryKey: ["pois", uid], queryFn: fetchPois }); // keyed by user (RLS POIs)

  const counties = useMemo(
    () => countiesQuery.data ?? [],
    [countiesQuery.data],
  );

  const cities = useMemo(() => citiesQuery.data ?? [], [citiesQuery.data]);
  const pois = useMemo(() => poisQuery.data ?? [], [poisQuery.data]);

  const { poiTypes, poiTypeOrder } = useMemo(
    () => mergePoiTypes(poiTypesQuery.data ?? []),
    [poiTypesQuery.data],
  );

  const referenceLoaded =
    countiesQuery.isSuccess &&
    citiesQuery.isSuccess &&
    poiTypesQuery.isSuccess &&
    poisQuery.isSuccess;

  // Id lookups + the defaults-only slice the explored figures are based on
  const countyById = useMemo(
    () => new Map(counties.map((county) => [county.id, county])),
    [counties],
  );
  const cityById = useMemo(
    () => new Map(cities.map((city) => [city.id, city])),
    [cities],
  );
  const poiById = useMemo(
    () => new Map(pois.map((poi) => [poi.id, poi])),
    [pois],
  );
  const defaultPois = useMemo(
    () => pois.filter((poi) => poi.owner_id == null),
    [pois],
  );

  const { addCustomPoi, deleteCustomPoi } = useCustomPoiMutations(uid);

  const value = useMemo<MapData>(
    () => ({
      referenceLoaded,
      counties,
      cities,
      pois,
      poiTypes,
      poiTypeOrder,
      getCounty: (countyId) => countyById.get(countyId),
      countyName: (countyId) => countyById.get(countyId)?.name ?? "",
      getCity: (cityId) => cityById.get(cityId),
      getPoi: (poiId) => poiById.get(poiId),
      mappablePois: () => mappablePois(pois),
      poisForCity: (cityId) => poisForCity(pois, cityId),
      looseCountyPois: (countyId) => looseCountyPois(defaultPois, countyId),
      customPoisForCounty: (countyId) => customPoisForCounty(pois, countyId),
      citiesForCounty: (countyId) => citiesForCounty(cities, countyId),
      getVisitedPercent: (countyId, poiDataMap) =>
        percentVisited(countyDefaultPois(defaultPois, countyId), poiDataMap),
      getCityPercent: (cityId, poiDataMap) =>
        percentVisited(poisForCity(pois, cityId), poiDataMap),
      addCustomPoi,
      deleteCustomPoi,
    }),
    [
      referenceLoaded,
      counties,
      cities,
      pois,
      defaultPois,
      poiTypes,
      poiTypeOrder,
      countyById,
      cityById,
      poiById,
      addCustomPoi,
      deleteCustomPoi,
    ],
  );

  return (
    <MapDataContext.Provider value={value}>{children}</MapDataContext.Provider>
  );
}
