/**
 * Geography the database doesn't have: people say "the east", "Dalmatia" or "the coast", while the
 * data only knows counties. These groupings let search_places filter by region, and the Croatian
 * county names let the agent (and the user) refer to counties the way they're said in Croatian
 */

export const REGIONS = {
  zagreb: { label: "Zagreb i okolica", counties: ["zagreb-city", "zagreb-county"] },
  sjeverna: {
    label: "Sjeverna Hrvatska (Zagorje, Međimurje, Podravina)",
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
    counties: ["sisak-moslavina", "karlovac"],
  },
  slavonija: {
    label: "Slavonija i Baranja (istok)",
    counties: [
      "osijek-baranja",
      "vukovar-srijem",
      "brod-posavina",
      "pozega-slavonia",
      "virovitica-podravina",
    ],
  },
  lika: { label: "Lika", counties: ["lika-senj"] },
  istra_kvarner: {
    label: "Istra i Kvarner",
    counties: ["istria", "primorje-gorski-kotar"],
  },
  dalmacija: {
    label: "Dalmacija (jug)",
    counties: ["zadar", "sibenik-knin", "split-dalmatia", "dubrovnik-neretva"],
  },
  // Overlapping group, for "the coast" / "the sea"
  obala: {
    label: "Jadranska obala",
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
} as const satisfies Record<string, { label: string; counties: readonly string[] }>;

export type RegionId = keyof typeof REGIONS;
export const REGION_IDS = Object.keys(REGIONS) as [RegionId, ...RegionId[]];

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
