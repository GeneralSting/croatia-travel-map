/**
 * Geography the database doesn't have: people say "the east", "Dalmatia" or "the coast", while the
 * data only knows counties. These groupings let search_places filter by region, and the Croatian
 * county names let the agent (and the user) refer to counties the way they're said in Croatian
 *
 * Per region, for the starter prompts (Croatian needs the right case, so they're written out):
 *  - inLabel: "in <region>" (locative) - "Preporuči mi nešto u Slavoniji"
 *  - nearLabel: an anchor place in the genitive - "Vikend izlet blizu Osijeka"
 */

export const REGIONS = {
  zagreb: {
    label: "Zagreb i okolica",
    inLabel: "u Zagrebu i okolici",
    nearLabel: "Zagreba",
    counties: ["zagreb-city", "zagreb-county"],
  },
  sjeverna: {
    label: "Sjeverna Hrvatska (Zagorje, Međimurje, Podravina)",
    inLabel: "na sjeveru Hrvatske",
    nearLabel: "Varaždina",
    counties: [
      "krapina-zagorje",
      "varazdin",
      "medimurje",
      "koprivnica-krizevci",
      "bjelovar-bilogora",
    ],
  },
  sredisnja: {
    label: "Središnja Hrvatska (Banovina, Kordun, Pokuplje)",
    inLabel: "u središnjoj Hrvatskoj",
    nearLabel: "Karlovca",
    counties: ["sisak-moslavina", "karlovac"],
  },
  slavonija: {
    label: "Slavonija i Baranja (istok)",
    inLabel: "u Slavoniji",
    nearLabel: "Osijeka",
    counties: [
      "osijek-baranja",
      "vukovar-srijem",
      "brod-posavina",
      "pozega-slavonia",
      "virovitica-podravina",
    ],
  },
  lika: {
    label: "Lika",
    inLabel: "u Lici",
    nearLabel: "Plitvičkih jezera",
    counties: ["lika-senj"],
  },
  istra_kvarner: {
    label: "Istra i Kvarner",
    inLabel: "u Istri i na Kvarneru",
    nearLabel: "Rijeke",
    counties: ["istria", "primorje-gorski-kotar"],
  },
  dalmacija: {
    label: "Dalmacija (jug)",
    inLabel: "u Dalmaciji",
    nearLabel: "Splita",
    counties: ["zadar", "sibenik-knin", "split-dalmatia", "dubrovnik-neretva"],
  },
  // Overlapping group, for "the coast" / "the sea"
  obala: {
    label: "Jadranska obala",
    inLabel: "na obali",
    nearLabel: "mora",
    counties: [
      "istria",
      "primorje-gorski-kotar",
      "lika-senj",
      "zadar",
      "sibenik-knin",
      "split-dalmatia",
      "dubrovnik-neretva",
    ],
  },
} as const satisfies Record<
  string,
  { label: string; inLabel: string; nearLabel: string; counties: readonly string[] }
>;

export type RegionId = keyof typeof REGIONS;
export const REGION_IDS = Object.keys(REGIONS) as [RegionId, ...RegionId[]];

// The non-overlapping regions - every county belongs to exactly one ("obala" spans several)
export const PRIMARY_REGION_IDS = REGION_IDS.filter((id) => id !== "obala");

/**
 * A region's explored percentage: the average over its counties (each county weighs the same, so a
 * big county doesn't hide the empty ones next to it)
 */
export function regionExploredPercent(
  regionId: RegionId,
  countyPercents: Record<string, number>,
): number {
  const counties = REGIONS[regionId].counties;
  const total = counties.reduce((sum, id) => sum + (countyPercents[id] ?? 0), 0);
  return Math.round(total / counties.length);
}

/**
 * Words people use for a region rather than a county. Checked before county matching, because
 * "Slavonija" would otherwise fully match the single county "Požega-Slavonia"
 * Keys are normalised (lowercase, no diacritics)
 */
export const REGION_ALIASES: Record<string, RegionId> = {
  slavonija: "slavonija",
  slavonia: "slavonija",
  "slavonija i baranja": "slavonija",
  istok: "slavonija",
  "istocna hrvatska": "slavonija",
  dalmacija: "dalmacija",
  dalmatia: "dalmacija",
  jug: "dalmacija",
  "sjeverna hrvatska": "sjeverna",
  sjever: "sjeverna",
  "sredisnja hrvatska": "sredisnja",
  kvarner: "istra_kvarner",
  "istra i kvarner": "istra_kvarner",
  obala: "obala",
  jadran: "obala",
  more: "obala",
};

// The primary region of each county (excluding the overlapping "obala")
export function regionOfCounty(countyId: string): RegionId | null {
  for (const [id, region] of Object.entries(REGIONS)) {
    if (id === "obala") continue;
    if ((region.counties as readonly string[]).includes(countyId)) return id as RegionId;
  }
  return null;
}

export const COUNTY_NAME_HR: Record<string, string> = {
  "zagreb-city": "Grad Zagreb",
  "zagreb-county": "Zagrebačka županija",
  "krapina-zagorje": "Krapinsko-zagorska županija",
  varazdin: "Varaždinska županija",
  medimurje: "Međimurska županija",
  "koprivnica-krizevci": "Koprivničko-križevačka županija",
  "bjelovar-bilogora": "Bjelovarsko-bilogorska županija",
  "sisak-moslavina": "Sisačko-moslavačka županija",
  karlovac: "Karlovačka županija",
  "osijek-baranja": "Osječko-baranjska županija",
  "vukovar-srijem": "Vukovarsko-srijemska županija",
  "brod-posavina": "Brodsko-posavska županija",
  "pozega-slavonia": "Požeško-slavonska županija",
  "virovitica-podravina": "Virovitičko-podravska županija",
  "lika-senj": "Ličko-senjska županija",
  istria: "Istarska županija",
  "primorje-gorski-kotar": "Primorsko-goranska županija",
  zadar: "Zadarska županija",
  "sibenik-knin": "Šibensko-kninska županija",
  "split-dalmatia": "Splitsko-dalmatinska županija",
  "dubrovnik-neretva": "Dubrovačko-neretvanska županija",
};
