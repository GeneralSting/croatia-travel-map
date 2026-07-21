// One-time build step. Produces two local files from Natural Earth (public domain):
//
//   public/geo/croatia-counties.geojson  — the 21 county shapes with REAL coastline (land only,
//                                           sea is empty) and the major islands removed
//   public/geo/croatia-islands.geojson   — the ~10 biggest islands as their own features, each
//                                           tagged with the county it sits in (county_id)
//
// Why Natural Earth: the previous source stored counties as coarse administrative blobs that
// filled the sea (so islands were fused into the land). Natural Earth's admin-1 provinces are
// land-accurate and keep islands as separate polygons, which is what lets us draw islands as
// distinct shapes floating in the sea and link them to their county on hover.
//
// Source: nvkelso/natural-earth-vector (ne_10m_admin_1_states_provinces).
// Run with: node scripts/build-geojson.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { statSync } from "node:fs";

const NE_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
const PRECISION = 3; // ~110m — plenty at country zoom, keeps the file small

// NE iso_3166_2 -> our county id + display name.
// HR-11 (Požega-Slavonia) is missing from NE and HR-12 (Brod-Posavina) appears twice;
// the two HR-12 features are split by latitude below (northern = Požega).
const ISO_TO_COUNTY = {
  "HR-01": ["zagreb-county", "Zagreb County"],
  "HR-02": ["krapina-zagorje", "Krapina-Zagorje"],
  "HR-03": ["sisak-moslavina", "Sisak-Moslavina"],
  "HR-04": ["karlovac", "Karlovac County"],
  "HR-05": ["varazdin", "Varaždin County"],
  "HR-06": ["koprivnica-krizevci", "Koprivnica-Križevci"],
  "HR-07": ["bjelovar-bilogora", "Bjelovar-Bilogora"],
  "HR-08": ["primorje-gorski-kotar", "Primorje-Gorski Kotar"],
  "HR-09": ["lika-senj", "Lika-Senj"],
  "HR-10": ["virovitica-podravina", "Virovitica-Podravina"],
  "HR-13": ["zadar", "Zadar County"],
  "HR-14": ["osijek-baranja", "Osijek-Baranja"],
  "HR-15": ["sibenik-knin", "Šibenik-Knin"],
  "HR-16": ["vukovar-srijem", "Vukovar-Srijem"],
  "HR-17": ["split-dalmatia", "Split-Dalmatia"],
  "HR-18": ["istria", "Istria County"],
  "HR-19": ["dubrovnik-neretva", "Dubrovnik-Neretva"],
  "HR-20": ["medimurje", "Međimurje County"],
  "HR-21": ["zagreb-city", "City of Zagreb"],
};
const POZEGA = ["pozega-slavonia", "Požega-Slavonia"];
const BROD = ["brod-posavina", "Brod-Posavina"];

// Major islands to break out. `c` is the island's approximate centroid [lng,lat]; each island
// is matched to the nearest non-mainland polygon (robust for thin/curved islands like Pag where
// a single interior point can fall in a bay). The owning county is resolved automatically.
const ISLANDS = [
  { island_id: "krk", name: "Krk", c: [14.62, 45.07] },
  { island_id: "cres", name: "Cres", c: [14.41, 44.9] },
  { island_id: "losinj", name: "Lošinj", c: [14.43, 44.6] },
  { island_id: "rab", name: "Rab", c: [14.76, 44.78] },
  { island_id: "pag", name: "Pag", c: [14.99, 44.5] },
  { island_id: "dugi-otok", name: "Dugi Otok", c: [15.0, 44.02] },
  { island_id: "brac", name: "Brač", c: [16.62, 43.32] },
  { island_id: "hvar", name: "Hvar", c: [16.5, 43.16] },
  { island_id: "vis", name: "Vis", c: [16.18, 43.05] },
  { island_id: "korcula", name: "Korčula", c: [16.9, 42.95] },
  { island_id: "mljet", name: "Mljet", c: [17.5, 42.75] },
];
const MATCH_THRESHOLD = 0.3; // degrees (~30km) — islands are far enough apart to be unambiguous

const round = (n) => Math.round(n * 10 ** PRECISION) / 10 ** PRECISION;
function roundCoords(c) {
  return typeof c[0] === "number" ? [round(c[0]), round(c[1])] : c.map(roundCoords);
}
function collectPolygons(g, out = []) {
  if (!g) return out;
  if (g.type === "Polygon") out.push(g.coordinates);
  else if (g.type === "MultiPolygon") out.push(...g.coordinates);
  return out;
}
function ringArea(r) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++)
    a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(a / 2);
}
function ringCentroid(r) {
  let sx = 0, sy = 0;
  for (const [x, y] of r) { sx += x; sy += y; }
  return [sx / r.length, sy / r.length];
}
const dist = ([ax, ay], [bx, by]) => Math.hypot(ax - bx, ay - by);
function centerLat(polys) {
  let s = 90, n = -90;
  for (const p of polys) for (const [, y] of p[0]) { if (y < s) s = y; if (y > n) n = y; }
  return (s + n) / 2;
}

async function main() {
  const res = await fetch(NE_URL);
  if (!res.ok) throw new Error(`NE: HTTP ${res.status}`);
  const all = await res.json();
  const hr = all.features.filter((f) => f.properties.admin === "Croatia");

  // Resolve each NE feature to a county (handling the HR-11/HR-12 quirk).
  const counties = []; // { county_id, name, polygons }
  const hr12 = hr.filter((f) => f.properties.iso_3166_2 === "HR-12");
  const hr12Pozega =
    hr12.length === 2
      ? (centerLat(collectPolygons(hr12[0].geometry)) > centerLat(collectPolygons(hr12[1].geometry))
          ? hr12[0]
          : hr12[1])
      : null;

  for (const f of hr) {
    const iso = f.properties.iso_3166_2;
    let entry;
    if (iso === "HR-12") entry = f === hr12Pozega ? POZEGA : BROD;
    else entry = ISO_TO_COUNTY[iso];
    if (!entry) {
      console.warn(`! unmapped NE feature iso=${iso} name=${f.properties.name}`);
      continue;
    }
    counties.push({ county_id: entry[0], name: entry[1], polygons: collectPolygons(f.geometry) });
  }

  // Mark each county's largest polygon as its mainland so we never extract it.
  for (const c of counties) {
    const areas = c.polygons.map((p) => ringArea(p[0]));
    c.mainlandIdx = areas.indexOf(Math.max(...areas));
  }

  // Extract islands by matching each target to the nearest non-mainland polygon (centroid).
  const islandFeatures = [];
  const used = new Set(); // `${county_id}:${idx}` already taken
  for (const island of ISLANDS) {
    let best = null;
    for (const county of counties) {
      county.polygons.forEach((poly, idx) => {
        if (idx === county.mainlandIdx) return;
        const key = `${county.county_id}:${idx}`;
        if (used.has(key)) return;
        const d = dist(island.c, ringCentroid(poly[0]));
        if (!best || d < best.d) best = { county, idx, d, key };
      });
    }
    if (!best || best.d > MATCH_THRESHOLD) {
      console.warn(`! ${island.name}: no nearby island polygon (best ${best ? best.d.toFixed(3) : "n/a"}) — skipped`);
      continue;
    }
    used.add(best.key);
    islandFeatures.push({
      type: "Feature",
      properties: { island_id: island.island_id, name: island.name, county_id: best.county.county_id },
      geometry: { type: "Polygon", coordinates: roundCoords(best.county.polygons[best.idx]) },
      _ref: best, // temporary, stripped below
    });
    console.log(`✓ ${island.name} -> ${best.county.county_id} (d=${best.d.toFixed(3)})`);
  }

  // Remove the extracted island polygons from their counties (descending idx per county).
  const byCounty = new Map();
  for (const f of islandFeatures) {
    const { county, idx } = f._ref;
    (byCounty.get(county) ?? byCounty.set(county, []).get(county)).push(idx);
    delete f._ref;
  }
  for (const [county, idxs] of byCounty) {
    idxs.sort((a, b) => b - a).forEach((i) => county.polygons.splice(i, 1));
  }

  const countyFeatures = counties.map((c) => ({
    type: "Feature",
    properties: { county_id: c.county_id, name: c.name },
    geometry: { type: "MultiPolygon", coordinates: roundCoords(c.polygons) },
  }));

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const geoDir = resolve(__dirname, "..", "public", "geo");
  await mkdir(geoDir, { recursive: true });
  const countiesPath = resolve(geoDir, "croatia-counties.geojson");
  const islandsPath = resolve(geoDir, "croatia-islands.geojson");
  await writeFile(countiesPath, JSON.stringify({ type: "FeatureCollection", features: countyFeatures }));
  await writeFile(islandsPath, JSON.stringify({ type: "FeatureCollection", features: islandFeatures }));

  const kb = (p) => Math.round(statSync(p).size / 1024);
  console.log(`\nWrote ${countyFeatures.length} counties (${kb(countiesPath)} KB) + ${islandFeatures.length} islands (${kb(islandsPath)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
