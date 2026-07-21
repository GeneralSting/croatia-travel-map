// Barrel for the map domain: types, static data, and selector helpers. Call sites import from
// "@/features/map-explorer/data" and get a single, stable surface (the source is split across
// ../types, ./croatiaData, and ../utils/selectors).

export * from "@/features/map-explorer/types";
export * from "@/features/map-explorer/data/croatiaData";
export * from "@/features/map-explorer/utils/selectors";
