// Builds public/geo/croatia-outline.geojson — a detailed national outline (mainland + islands)
// used ONLY to validate where a user may drop a new place (see app/lib/geo.ts). The county /
// island GeoJSON used for the choropleth is too generalised for this: ~25% of real coastal /
// island POIs fall outside it. This outline contains them, so a tight 1 km tolerance is enough.
//
// Source: georgique/world-geojson (public domain-ish, derived from Natural Earth / OSM).
// Run once: node scripts/build-outline.mjs
//
// We strip properties and round coordinates to 4 decimals (~11 m) to keep the asset small.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "https://raw.githubusercontent.com/georgique/world-geojson/develop/countries/croatia.json";
const OUT = join(root, "public", "geo", "croatia-outline.geojson");

const res = await fetch(SRC);
if (!res.ok) throw new Error(`Failed to fetch outline: ${res.status}`);
const raw = await res.json();

const round = (n) => Math.round(n * 1e4) / 1e4;
const roundCoords = (a) =>
  typeof a[0] === "number" ? [round(a[0]), round(a[1])] : a.map(roundCoords);

const outline = {
  type: "FeatureCollection",
  features: raw.features.map((f) => ({
    type: "Feature",
    properties: {},
    geometry: { type: f.geometry.type, coordinates: roundCoords(f.geometry.coordinates) },
  })),
};

writeFileSync(OUT, JSON.stringify(outline));
console.log(
  `Wrote ${OUT} — ${outline.features.length} features, ${Math.round(JSON.stringify(outline).length / 1024)} KB`,
);
