// Static reference data for the Croatia Explorer map: the 21 counties, their points of
// interest, the POI type catalogue, and the helpers that turn a user's progress into a
// "percent explored" and a fill colour. Pure data + pure functions — no side effects.

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

export const COUNTIES: County[] = [
  { id: "zagreb-county", name: "Zagreb County", color: "#334155" },
  { id: "zagreb-city", name: "City of Zagreb", color: "#334155" },
  { id: "krapina-zagorje", name: "Krapina-Zagorje", color: "#334155" },
  { id: "sisak-moslavina", name: "Sisak-Moslavina", color: "#334155" },
  { id: "karlovac", name: "Karlovac County", color: "#334155" },
  { id: "varazdin", name: "Varaždin County", color: "#334155" },
  { id: "koprivnica-krizevci", name: "Koprivnica-Križevci", color: "#334155" },
  { id: "bjelovar-bilogora", name: "Bjelovar-Bilogora", color: "#334155" },
  {
    id: "primorje-gorski-kotar",
    name: "Primorje-Gorski Kotar",
    color: "#334155",
  },
  { id: "lika-senj", name: "Lika-Senj", color: "#334155" },
  {
    id: "virovitica-podravina",
    name: "Virovitica-Podravina",
    color: "#334155",
  },
  { id: "pozega-slavonia", name: "Požega-Slavonia", color: "#334155" },
  { id: "brod-posavina", name: "Brod-Posavina", color: "#334155" },
  { id: "zadar", name: "Zadar County", color: "#334155" },
  { id: "osijek-baranja", name: "Osijek-Baranja", color: "#334155" },
  { id: "sibenik-knin", name: "Šibenik-Knin", color: "#334155" },
  { id: "vukovar-srijem", name: "Vukovar-Srijem", color: "#334155" },
  { id: "split-dalmatia", name: "Split-Dalmatia", color: "#334155" },
  { id: "istria", name: "Istria County", color: "#334155" },
  { id: "dubrovnik-neretva", name: "Dubrovnik-Neretva", color: "#334155" },
  { id: "medimurje", name: "Međimurje County", color: "#334155" },
];

/** Simple point indicators drawn on the map (major towns + notable mountains). */
export interface PlaceMarker {
  name: string;
  lat: number;
  lng: number;
}

export const MOUNTAINS: PlaceMarker[] = [
  { name: "Medvednica (Sljeme)", lat: 45.8994, lng: 15.9472 },
  { name: "Žumberačka gora", lat: 45.7833, lng: 15.4667 },
  { name: "Strahinjščica", lat: 46.1833, lng: 15.8667 },
  { name: "Ivanščica", lat: 46.1833, lng: 16.1167 },
  { name: "Kalnik", lat: 46.1311, lng: 16.4633 },
  { name: "Moslavačka gora", lat: 45.6214, lng: 16.7378 },
  { name: "Bilogora", lat: 45.9083, lng: 16.9917 },
  { name: "Klek", lat: 45.2581, lng: 15.1436 },
  { name: "Risnjak", lat: 45.4303, lng: 14.6186 },
  { name: "Snježnik", lat: 45.4419, lng: 14.5828 },
  { name: "Učka (Vojak)", lat: 45.2914, lng: 14.2014 },
  { name: "Sjeverni Velebit (Zavižan)", lat: 44.8142, lng: 14.9753 },
  { name: "Vaganski vrh (Velebit)", lat: 44.5361, lng: 15.4208 },
  { name: "Papuk (Kozjak)", lat: 45.5256, lng: 17.6017 },
  { name: "Psunj (Brezovo Polje)", lat: 45.3986, lng: 17.3017 },
  { name: "Dilj gora", lat: 45.2833, lng: 18.0167 },
  // Sinjal (1831 m), Croatia's highest peak: east and slightly north of Knin, on the BiH border.
  { name: "Dinara (Sinjal)", lat: 44.046, lng: 16.414 },
  { name: "Biokovo (Sveti Jure)", lat: 43.3414, lng: 17.0506 },
  { name: "Vidova gora (Brač)", lat: 43.2806, lng: 16.6375 },
  { name: "Sveti Ilija (Pelješac)", lat: 42.9972, lng: 17.1611 },
  { name: "Mohokos", lat: 46.4172, lng: 16.3542 },
];

export const POIS: POI[] = [
  // ── City of Zagreb ──────────────────────────────────────────────
  {
    id: "zagreb-city-center",
    county_id: "zagreb-city",
    name: "Zagreb Old Town",
    type: "city",
    description: "Baroque upper town, Dolac market, Cathedral",
  },
  {
    id: "zagreb-medvednica",
    county_id: "zagreb-city",
    name: "Medvednica Mountain",
    type: "mountain",
    description: "Mountain park above Zagreb, Sljeme peak 1033m",
  },
  {
    id: "zagreb-jarun",
    county_id: "zagreb-city",
    name: "Jarun Lake",
    type: "lake",
    description: "Recreational lake in Zagreb, rowing & swimming",
  },
  {
    id: "zagreb-maksimir",
    county_id: "zagreb-city",
    name: "Maksimir Park",
    type: "nature",
    description: "Oldest public park in SE Europe, 316ha",
  },
  {
    id: "zagreb-bundek",
    county_id: "zagreb-city",
    name: "Bundek Lake",
    type: "lake",
    description: "City lake with beaches and playgrounds",
  },
  {
    id: "zagreb-lotrscak",
    county_id: "zagreb-city",
    name: "Lotrščak Tower",
    type: "landmark",
    description: "Medieval tower with cannon fired daily at noon",
  },

  // ── Zagreb County ─────────────────────────────────────────────
  {
    id: "samobor-town",
    county_id: "zagreb-county",
    name: "Samobor",
    type: "city",
    description: "Charming town known for kremsnita cake",
  },
  {
    id: "samobor-gorje",
    county_id: "zagreb-county",
    name: "Samoborsko Gorje",
    type: "mountain",
    description: "Low mountain range near Samobor",
  },
  {
    id: "zumberak",
    county_id: "zagreb-county",
    name: "Žumberak Nature Park",
    type: "nature",
    description: "Green hills, old villages, wolves and bears",
  },
  {
    id: "velika-gorica",
    county_id: "zagreb-county",
    name: "Velika Gorica",
    type: "city",
    description: "Town near Zagreb airport",
  },
  {
    id: "turopolje",
    county_id: "zagreb-county",
    name: "Turopolje",
    type: "nature",
    description: "Traditional oak forests, old wooden churches",
  },

  // ── Krapina-Zagorje ──────────────────────────────────────────
  {
    id: "krapina-neanderthal",
    county_id: "krapina-zagorje",
    name: "Krapina Neanderthal Museum",
    type: "landmark",
    description: "World-class prehistoric site with Neanderthal bones",
  },
  {
    id: "trakoscan-castle",
    county_id: "krapina-zagorje",
    name: "Trakošćan Castle",
    type: "landmark",
    description: "Romantic 13th-century castle above a lake",
  },
  {
    id: "trakoscan-lake",
    county_id: "krapina-zagorje",
    name: "Trakošćan Lake",
    type: "lake",
    description: "Serene artificial lake beside the castle",
  },
  {
    id: "pregrada",
    county_id: "krapina-zagorje",
    name: "Pregrada",
    type: "city",
    description: "Small Zagorje town with a beautiful church",
  },
  {
    id: "kumrovec",
    county_id: "krapina-zagorje",
    name: "Kumrovec Ethnological Museum",
    type: "landmark",
    description: "Open-air village museum, birthplace of Tito",
  },
  {
    id: "klanjec",
    county_id: "krapina-zagorje",
    name: "Klanjec",
    type: "city",
    description: "Town with Antun Augustinčić gallery",
  },
  {
    id: "sutinska-vrela",
    county_id: "krapina-zagorje",
    name: "Sutinska Vrela Spa",
    type: "nature",
    description: "Thermal spring resort in Zagorje hills",
  },

  // ── Varaždin County ───────────────────────────────────────────
  {
    id: "varazdin-old-town",
    county_id: "varazdin",
    name: "Varaždin Old Town",
    type: "city",
    description: "Baroque city, well-preserved medieval castle",
  },
  {
    id: "varazdin-castle",
    county_id: "varazdin",
    name: "Varaždin Castle",
    type: "landmark",
    description: "Well-preserved fortress now a city museum",
  },
  {
    id: "varazdin-cemetery",
    county_id: "varazdin",
    name: "Varaždin Cemetery",
    type: "landmark",
    description: "One of Europe's most beautiful cemeteries, a park-museum",
  },
  {
    id: "cakovec",
    county_id: "varazdin",
    name: "Čakovec",
    type: "city",
    description: "Regional center with a restored Renaissance castle",
  },
  {
    id: "varazdin-toplice",
    county_id: "varazdin",
    name: "Varaždinske Toplice",
    type: "nature",
    description: "Roman thermal baths still active today",
  },

  // ── Koprivnica-Križevci ───────────────────────────────────────
  {
    id: "koprivnica-city",
    county_id: "koprivnica-krizevci",
    name: "Koprivnica",
    type: "city",
    description: "Podravina market town, known for Podravka food company",
  },
  {
    id: "hlebine-naive-art",
    county_id: "koprivnica-krizevci",
    name: "Hlebine Gallery",
    type: "landmark",
    description: "Village birthplace of Croatian naive art movement",
  },
  {
    id: "đurđevac-castle",
    county_id: "koprivnica-krizevci",
    name: "Đurđevac Old Town",
    type: "landmark",
    description: "Medieval fortress, legend of the Picok",
  },
  {
    id: "krizevci-city",
    county_id: "koprivnica-krizevci",
    name: "Križevci",
    type: "city",
    description: "Town with beautiful Baroque architecture",
  },

  // ── Bjelovar-Bilogora ─────────────────────────────────────────
  {
    id: "bjelovar-city",
    county_id: "bjelovar-bilogora",
    name: "Bjelovar",
    type: "city",
    description: "Grid-planned 18th century garrison town",
  },
  {
    id: "bilogora-forest",
    county_id: "bjelovar-bilogora",
    name: "Bilogora Hills",
    type: "mountain",
    description: "Forested ridge, wine growing area",
  },
  {
    id: "daruvar-spa",
    county_id: "bjelovar-bilogora",
    name: "Daruvar Spa Town",
    type: "nature",
    description: "Roman thermal springs, Czech minority heritage",
  },

  // ── Sisak-Moslavina ───────────────────────────────────────────
  {
    id: "sisak-fortress",
    county_id: "sisak-moslavina",
    name: "Sisak Fortress",
    type: "landmark",
    description: "Renaissance fortress, famous 1593 battle site",
  },
  {
    id: "lonjsko-polje",
    county_id: "sisak-moslavina",
    name: "Lonjsko Polje Nature Park",
    type: "nature",
    description: "Largest floodplain in Europe, white storks, old villages",
  },
  {
    id: "kutina-city",
    county_id: "sisak-moslavina",
    name: "Kutina",
    type: "city",
    description: "Moslavina regional center",
  },
  {
    id: "jasenovac-memorial",
    county_id: "sisak-moslavina",
    name: "Jasenovac Memorial",
    type: "landmark",
    description: "WWII memorial site of great historical significance",
  },

  // ── Karlovac County ───────────────────────────────────────────
  {
    id: "karlovac-city",
    county_id: "karlovac",
    name: "Karlovac",
    type: "city",
    description: "Star-shaped Renaissance town, four rivers confluence",
  },
  {
    id: "korana-river",
    county_id: "karlovac",
    name: "Korana River",
    type: "river",
    description: "Crystal-clear karst river, ideal for kayaking",
  },
  {
    id: "mrežnica-river",
    county_id: "karlovac",
    name: "Mrežnica River",
    type: "river",
    description: "River with travertine waterfalls and swimming holes",
  },
  {
    id: "slunj-rastoke",
    county_id: "karlovac",
    name: "Rastoke (Little Plitvice)",
    type: "nature",
    description: "Watermills and waterfalls where Slunjčica meets Korana",
  },
  {
    id: "risnjak-np",
    county_id: "karlovac",
    name: "Risnjak National Park",
    type: "national_park",
    description: "Pristine mountain forests, lynx habitat",
  },
  {
    id: "ogulin-city",
    county_id: "karlovac",
    name: "Ogulin",
    type: "city",
    description: "Town of fairy tales, home of Ivana Brlić-Mažuranić",
  },

  // ── Primorje-Gorski Kotar ─────────────────────────────────────
  {
    id: "rijeka-city",
    county_id: "primorje-gorski-kotar",
    name: "Rijeka",
    type: "city",
    description: "Croatia's largest port, European Capital of Culture 2020",
  },
  {
    id: "opatija-riviera",
    county_id: "primorje-gorski-kotar",
    name: "Opatija Riviera",
    type: "city",
    description: "Habsburg-era resort town, lungomare promenade",
  },
  {
    id: "ucka-mountain",
    county_id: "primorje-gorski-kotar",
    name: "Učka Nature Park",
    type: "mountain",
    description: "Mountain above Opatija Riviera, 1401m Vojak peak",
  },
  {
    id: "kvarner-gulf",
    county_id: "primorje-gorski-kotar",
    name: "Kvarner Gulf",
    type: "nature",
    description: "Large sheltered bay with islands Krk, Cres, Lošinj, Rab",
  },
  {
    id: "krk-island",
    county_id: "primorje-gorski-kotar",
    name: "Krk Island",
    type: "island",
    description: "Largest Croatian island, connected by bridge to mainland",
  },
  {
    id: "cres-island",
    county_id: "primorje-gorski-kotar",
    name: "Cres Island",
    type: "island",
    description: "Wild island with griffon vultures and Vrana Lake",
  },
  {
    id: "losinj-island",
    county_id: "primorje-gorski-kotar",
    name: "Lošinj Island",
    type: "island",
    description: "'Island of vitality', dolphins in the bay",
  },
  {
    id: "gorski-kotar",
    county_id: "primorje-gorski-kotar",
    name: "Gorski Kotar Highlands",
    type: "mountain",
    description: "Green mountain region, bears and wolves, Risnjak & Snježnik",
  },
  {
    id: "camp-krk",
    county_id: "primorje-gorski-kotar",
    name: "Camp Krk (Politin)",
    type: "campsite",
    description: "Family campsite on Krk island, pebble beach",
  },
  {
    id: "camp-kovačine",
    county_id: "primorje-gorski-kotar",
    name: "Camp Kovačine, Cres",
    type: "campsite",
    description: "Naturist camp on Cres with olive groves",
  },

  // ── Lika-Senj ─────────────────────────────────────────────────
  {
    id: "plitvice-lakes",
    county_id: "lika-senj",
    name: "Plitvice Lakes NP",
    type: "national_park",
    description: "UNESCO site, 16 terraced lakes with spectacular waterfalls",
  },
  {
    id: "velebit-north",
    county_id: "lika-senj",
    name: "Sjeverni Velebit NP",
    type: "national_park",
    description: "Northern Velebit, Hajdučki kukovi rock formations",
  },
  {
    id: "paklenica-np",
    county_id: "lika-senj",
    name: "Paklenica NP",
    type: "national_park",
    description: "Spectacular gorges, rock climbing mecca",
  },
  {
    id: "senj-nehaj",
    county_id: "lika-senj",
    name: "Senj & Nehaj Fortress",
    type: "landmark",
    description: "Uskok pirate town, dramatic coastal fortress",
  },
  {
    id: "gospic-city",
    county_id: "lika-senj",
    name: "Gospić",
    type: "city",
    description: "Lika regional center, Nikola Tesla Museum nearby",
  },
  {
    id: "plitvicka-jezera-village",
    county_id: "lika-senj",
    name: "Plitvička Jezera Village",
    type: "city",
    description: "Gateway village to Plitvice NP",
  },
  {
    id: "velebit-mountain",
    county_id: "lika-senj",
    name: "Velebit Mountain",
    type: "mountain",
    description: "Longest Croatian mountain range, 145km, 1757m Vaganski vrh",
  },
  {
    id: "camp-korana-plitvice",
    county_id: "lika-senj",
    name: "Camp Korana Plitvice",
    type: "campsite",
    description: "Campsite on Korana river near Plitvice Lakes",
  },

  // ── Virovitica-Podravina ──────────────────────────────────────
  {
    id: "virovitica-city",
    county_id: "virovitica-podravina",
    name: "Virovitica",
    type: "city",
    description: "Slavonian town with baroque church and park",
  },
  {
    id: "orahovica-park",
    county_id: "virovitica-podravina",
    name: "Orahovica",
    type: "city",
    description: "Town near Ružica Fortress ruins",
  },
  {
    id: "papuk-geopark",
    county_id: "virovitica-podravina",
    name: "Papuk Nature Park",
    type: "mountain",
    description: "Geopark with waterfalls and Ružica Castle",
  },

  // ── Požega-Slavonia ───────────────────────────────────────────
  {
    id: "pozega-city",
    county_id: "pozega-slavonia",
    name: "Požega",
    type: "city",
    description: "The Golden Valley, baroque churches, wine region",
  },
  {
    id: "kutjevo-winery",
    county_id: "pozega-slavonia",
    name: "Kutjevo Winery",
    type: "landmark",
    description: "One of Croatia's oldest wineries, Cistercian founded 1232",
  },
  {
    id: "papuk-pozega",
    county_id: "pozega-slavonia",
    name: "Papuk Highest Peak",
    type: "mountain",
    description: "953m summit, UNESCO Geopark territory",
  },

  // ── Brod-Posavina ─────────────────────────────────────────────
  {
    id: "slavonski-brod-city",
    county_id: "brod-posavina",
    name: "Slavonski Brod",
    type: "city",
    description: "River town with largest baroque fortress in Croatia",
  },
  {
    id: "brod-fortress",
    county_id: "brod-posavina",
    name: "Brod Fortress",
    type: "landmark",
    description: "18th-century star-shaped fortress on the Sava river",
  },

  // ── Osijek-Baranja ────────────────────────────────────────────
  {
    id: "osijek-city",
    county_id: "osijek-baranja",
    name: "Osijek",
    type: "city",
    description: "Slavonian capital, tvrđa baroque fortress-town",
  },
  {
    id: "osijek-tvrdja",
    county_id: "osijek-baranja",
    name: "Osijek Tvrđa",
    type: "landmark",
    description: "Best-preserved baroque fortress in Central Europe",
  },
  {
    id: "kopacki-rit",
    county_id: "osijek-baranja",
    name: "Kopački Rit Nature Park",
    type: "nature",
    description: "Floodplain wetland, Europe's largest bird sanctuary",
  },
  {
    id: "baranja-region",
    county_id: "osijek-baranja",
    name: "Baranja Wine Region",
    type: "nature",
    description: "Pannonian plains with Graševina white wine",
  },
  {
    id: "bilje-castle",
    county_id: "osijek-baranja",
    name: "Bilje (Prince Eugene Castle)",
    type: "landmark",
    description: "Estate of Prince Eugene of Savoy",
  },

  // ── Vukovar-Srijem ────────────────────────────────────────────
  {
    id: "vukovar-city",
    county_id: "vukovar-srijem",
    name: "Vukovar",
    type: "city",
    description: "City of remembrance, Danube-side, powerful war memorial",
  },
  {
    id: "vukovar-water-tower",
    county_id: "vukovar-srijem",
    name: "Vukovar Water Tower",
    type: "landmark",
    description: "Symbol of Croatian resilience and independence",
  },
  {
    id: "ilok-city",
    county_id: "vukovar-srijem",
    name: "Ilok",
    type: "city",
    description: "Easternmost Croatian town, Odescalchi Castle, wine cellars",
  },
  {
    id: "vinkovci-city",
    county_id: "vukovar-srijem",
    name: "Vinkovci",
    type: "city",
    description: "One of Europe's oldest continuously inhabited towns",
  },

  // ── Zadar County ──────────────────────────────────────────────
  {
    id: "zadar-old-town",
    county_id: "zadar",
    name: "Zadar Old Town",
    type: "city",
    description: "Roman forum, Sea Organ, Greeting to the Sun",
  },
  {
    id: "vrana-lake",
    county_id: "zadar",
    name: "Vrana Lake",
    type: "lake",
    description: "Croatia's largest natural lake, flamingos spotted",
  },
  {
    id: "pag-island",
    county_id: "zadar",
    name: "Pag Island",
    type: "island",
    description: "Moonscape island, Paški sir cheese, lace, nightlife",
  },
  {
    id: "nin-city",
    county_id: "zadar",
    name: "Nin",
    type: "city",
    description: "Oldest Croatian royal town, sandy Zaton beach",
  },
  {
    id: "zrmanja-river",
    county_id: "zadar",
    name: "Zrmanja Canyon",
    type: "river",
    description: "Wild river canyon, white-water rafting",
  },
  {
    id: "novigrad-sea",
    county_id: "zadar",
    name: "Novigrad on the Sea",
    type: "city",
    description: "Small walled coastal town, Novigrad Sea inlet",
  },
  {
    id: "telascica-nature-park",
    county_id: "zadar",
    name: "Telašćica Nature Park",
    type: "nature",
    description: "Bay on Dugi Otok with cliffs and salt lake",
  },
  {
    id: "camp-simuni",
    county_id: "zadar",
    name: "Camp Šimuni, Pag",
    type: "campsite",
    description: "Award-winning family camp on Pag island",
  },
  {
    id: "camp-strasko",
    county_id: "zadar",
    name: "Camp Straško, Novalja",
    type: "campsite",
    description: "Largest camp in Croatia, near Zrće beach",
  },
  {
    id: "kornati-np",
    county_id: "zadar",
    name: "Kornati National Park",
    type: "national_park",
    description: "Archipelago of 89 islands, UNESCO tentative list",
  },

  // ── Šibenik-Knin ──────────────────────────────────────────────
  {
    id: "sibenik-city",
    county_id: "sibenik-knin",
    name: "Šibenik",
    type: "city",
    description: "Dalmatian city, St. James Cathedral UNESCO site",
  },
  {
    id: "krka-np",
    county_id: "sibenik-knin",
    name: "Krka National Park",
    type: "national_park",
    description: "Travertine waterfalls on the Krka river, Skradinski Buk",
  },
  {
    id: "krka-river",
    county_id: "sibenik-knin",
    name: "Krka River",
    type: "river",
    description: "Karst river 73km, flows through spectacular canyons",
  },
  {
    id: "drnis-city",
    county_id: "sibenik-knin",
    name: "Drniš",
    type: "city",
    description: "Town known for pršut (prosciutto) and Ivan Meštrović",
  },
  {
    id: "knin-fortress",
    county_id: "sibenik-knin",
    name: "Knin Fortress",
    type: "landmark",
    description: "Largest Croatian fortress, medieval capital of Croatia",
  },
  {
    id: "camp-solaris",
    county_id: "sibenik-knin",
    name: "Camp Solaris, Šibenik",
    type: "campsite",
    description: "Premium resort camp near Šibenik",
  },
  {
    id: "skradin-town",
    county_id: "sibenik-knin",
    name: "Skradin",
    type: "city",
    description: "Gateway to Krka NP, charming riverside town",
  },

  // ── Split-Dalmatia ────────────────────────────────────────────
  {
    id: "split-city",
    county_id: "split-dalmatia",
    name: "Split",
    type: "city",
    description: "Diocletian's Palace, Croatia's second city",
  },
  {
    id: "diocletian-palace",
    county_id: "split-dalmatia",
    name: "Diocletian's Palace",
    type: "landmark",
    description: "UNESCO Roman palace where 3000 people still live today",
  },
  {
    id: "hvar-island",
    county_id: "split-dalmatia",
    name: "Hvar Island",
    type: "island",
    description: "Lavender fields, sunny riviera, historic town",
  },
  {
    id: "brac-island",
    county_id: "split-dalmatia",
    name: "Brač Island",
    type: "island",
    description: "Zlatni Rat beach, white limestone, highest Dalmatian peak",
  },
  {
    id: "vis-island",
    county_id: "split-dalmatia",
    name: "Vis Island",
    type: "island",
    description: "Remote unspoiled island, Biševo Blue Cave nearby",
  },
  {
    id: "biokovo-mountain",
    county_id: "split-dalmatia",
    name: "Biokovo Nature Park",
    type: "mountain",
    description: "Dramatic karst mountain, 1762m Sveti Jure, skywalk",
  },
  {
    id: "cetina-river",
    county_id: "split-dalmatia",
    name: "Cetina River Canyon",
    type: "river",
    description: "Rafting and canyoning in stunning gorge above Omiš",
  },
  {
    id: "makarska-riviera",
    county_id: "split-dalmatia",
    name: "Makarska Riviera",
    type: "nature",
    description: "30km of beaches under Biokovo mountain",
  },
  {
    id: "trogir-old-town",
    county_id: "split-dalmatia",
    name: "Trogir",
    type: "city",
    description: "UNESCO island town with Romanesque cathedral",
  },
  {
    id: "klis-fortress",
    county_id: "split-dalmatia",
    name: "Klis Fortress",
    type: "landmark",
    description: "Ancient fortress above Split, Game of Thrones filming",
  },
  {
    id: "camp-skrinja",
    county_id: "split-dalmatia",
    name: "Camp Škrinja, Brač",
    type: "campsite",
    description: "Secluded camp on Brač island with crystal water",
  },
  {
    id: "omis-city",
    county_id: "split-dalmatia",
    name: "Omiš",
    type: "city",
    description: "Pirate fortress town at the mouth of Cetina canyon",
  },

  // ── Istria County ─────────────────────────────────────────────
  {
    id: "pula-city",
    county_id: "istria",
    name: "Pula",
    type: "city",
    description: "Roman amphitheater, largest in the world still in use",
  },
  {
    id: "rovinj-city",
    county_id: "istria",
    name: "Rovinj",
    type: "city",
    description: "Romantic Venetian fishing town, colorful seafront houses",
  },
  {
    id: "porec-city",
    county_id: "istria",
    name: "Poreč",
    type: "city",
    description: "Euphrasian Basilica UNESCO, Roman cardo street",
  },
  {
    id: "motovun-hill-town",
    county_id: "istria",
    name: "Motovun",
    type: "city",
    description: "Hilltop medieval town surrounded by truffle forests",
  },
  {
    id: "brijuni-np",
    county_id: "istria",
    name: "Brijuni National Park",
    type: "national_park",
    description: "Archipelago near Pula, former Tito's residence, safari",
  },
  {
    id: "ucka-peak",
    county_id: "istria",
    name: "Učka Peak (Vojak)",
    type: "mountain",
    description: "Highest point of Istria, panorama over the Adriatic",
  },
  {
    id: "limski-kanal",
    county_id: "istria",
    name: "Lim Fjord",
    type: "nature",
    description: "Drowned river valley, oysters and mussels farmed here",
  },
  {
    id: "groznjan-village",
    county_id: "istria",
    name: "Grožnjan Artists Village",
    type: "landmark",
    description: "Medieval hilltop village, international music workshops",
  },
  {
    id: "istrian-truffles",
    county_id: "istria",
    name: "Buzet & Truffle Country",
    type: "nature",
    description: "Istrian interior, world-class black & white truffles",
  },
  {
    id: "camp-bi-village",
    county_id: "istria",
    name: "Camp Bi Village, Fažana",
    type: "campsite",
    description: "Large resort camp near Brijuni, great facilities",
  },
  {
    id: "camp-polari",
    county_id: "istria",
    name: "Camp Polari, Rovinj",
    type: "campsite",
    description: "Naturist camp with pinewood and pebble beaches",
  },
  {
    id: "vrsar-town",
    county_id: "istria",
    name: "Vrsar",
    type: "city",
    description: "Cosanova town on a hill, naturist Koversada camp nearby",
  },

  // ── Međimurje County ─────────────────────────────────────────
  {
    id: "cakovec-medimurje",
    county_id: "medimurje",
    name: "Čakovec",
    type: "city",
    description: "Capital of Međimurje, Zrinski Castle, medieval old town",
  },
  {
    id: "medimurje-wine",
    county_id: "medimurje",
    name: "Međimurje Wine Road",
    type: "nature",
    description:
      "Picturesque wine-growing hills, Graševina and Škrlet varieties",
  },
  {
    id: "sveti-martin-spa",
    county_id: "medimurje",
    name: "Sveti Martin on the Mura",
    type: "nature",
    description: "Wellness resort town on the Mura river",
  },

  // ── Dubrovnik-Neretva ─────────────────────────────────────────
  {
    id: "dubrovnik-city",
    county_id: "dubrovnik-neretva",
    name: "Dubrovnik",
    type: "city",
    description: "Pearl of the Adriatic, walled city, UNESCO World Heritage",
  },
  {
    id: "dubrovnik-walls",
    county_id: "dubrovnik-neretva",
    name: "Dubrovnik City Walls",
    type: "landmark",
    description: "2km walkable medieval walls with sea views",
  },
  {
    id: "korcula-island",
    county_id: "dubrovnik-neretva",
    name: "Korčula Island",
    type: "island",
    description: "Medieval walled town, Marco Polo birthplace legend",
  },
  {
    id: "mljet-np",
    county_id: "dubrovnik-neretva",
    name: "Mljet National Park",
    type: "national_park",
    description: "Saltwater lakes and Benedictine monastery on an island",
  },
  {
    id: "mljet-island",
    county_id: "dubrovnik-neretva",
    name: "Mljet Island",
    type: "island",
    description: "Greenest Croatian island, Homer's Ogygia",
  },
  {
    id: "neretva-delta",
    county_id: "dubrovnik-neretva",
    name: "Neretva River Delta",
    type: "river",
    description: "River delta with tangerines, frogs, eels, boat safaris",
  },
  {
    id: "lastovo-island",
    county_id: "dubrovnik-neretva",
    name: "Lastovo Island",
    type: "island",
    description: "Remote nature park island, stargazing reserve",
  },
  {
    id: "ston-walls",
    county_id: "dubrovnik-neretva",
    name: "Ston Walls & Salt Pans",
    type: "landmark",
    description: "14th-century walls, longest in Europe, Pelješac oysters",
  },
  {
    id: "peljesac-peninsula",
    county_id: "dubrovnik-neretva",
    name: "Pelješac Peninsula",
    type: "nature",
    description: "Dingač wine, sandy beaches, dramatic scenery",
  },
  {
    id: "konavle-valley",
    county_id: "dubrovnik-neretva",
    name: "Konavle Valley",
    type: "nature",
    description: "Lush valley behind Dubrovnik, folk costumes, watermills",
  },
  {
    id: "camp-solitudo-dubrovnik",
    county_id: "dubrovnik-neretva",
    name: "Camp Solitudo, Dubrovnik",
    type: "campsite",
    description: "Urban camp on Babin Kuk peninsula near Dubrovnik",
  },

  // ── Extra city attractions (attached to cities below) ─────────────
  {
    id: "pula-arena",
    county_id: "istria",
    name: "Pula Arena",
    type: "landmark",
    description: "Best-preserved Roman amphitheatre, still hosts summer concerts",
  },
  {
    id: "pazin-castle",
    county_id: "istria",
    name: "Pazin Castle & Abyss",
    type: "landmark",
    description: "Istria's largest medieval castle above Jules Verne's cave abyss",
  },
  {
    id: "rovinj-euphemia",
    county_id: "istria",
    name: "St. Euphemia Basilica",
    type: "landmark",
    description: "Baroque church crowning Rovinj's old town, climbable bell tower",
  },
  {
    id: "zadar-forum",
    county_id: "zadar",
    name: "Roman Forum & Sea Organ",
    type: "landmark",
    description: "Ancient forum, St. Donatus rotunda and the wave-powered Sea Organ",
  },
  {
    id: "split-marjan",
    county_id: "split-dalmatia",
    name: "Marjan Hill",
    type: "nature",
    description: "Forested peninsula park above Split with viewpoints and beaches",
  },
  {
    id: "dubrovnik-lovrijenac",
    county_id: "dubrovnik-neretva",
    name: "Fort Lovrijenac",
    type: "landmark",
    description: "Dramatic clifftop fortress guarding the western walls of Dubrovnik",
  },

  // ── Kampovi (iz istraživanja; opisi na hrvatskom) ─────────────────
  { id: "camp-zagreb-rakitje", county_id: "zagreb-county", name: "Camp Zagreb (Rakitje)", type: "campsite", description: "Autokamp na jezeru Rakitje kraj Svete Nedelje, nadomak Zagreba." },
  { id: "camp-vita-tuhelj", county_id: "krapina-zagorje", name: "Camp Vita Terme Tuhelj", type: "campsite", description: "Kamp uz toplice Terme Tuhelj s pristupom velikom vodenom parku." },
  { id: "camp-tradicije-cigoc", county_id: "sisak-moslavina", name: "Kamp Tradicije Čigoč", type: "campsite", description: "Mali obiteljski kamp u selu roda Čigoč u srcu Lonjskog polja." },
  { id: "camp-slapic", county_id: "karlovac", name: "Kamp Slapić (Mrežnica)", type: "campsite", description: "Nagrađivani kamp uz tirkiznu rijeku Mrežnicu u Dugoj Resi." },
  { id: "camp-korana", county_id: "karlovac", name: "Kamp Korana", type: "campsite", description: "Prostrani kamp uz kanjon bistre Korane blizu Slunja, baza za Plitvice." },
  { id: "camp-varazdinske-toplice", county_id: "varazdin", name: "Kamp Varaždinske Toplice", type: "campsite", description: "Autokamp u najstarijim hrvatskim toplicama uz ljekovitu termalnu vodu." },
  { id: "camp-vinia", county_id: "bjelovar-bilogora", name: "Kamp Vinia", type: "campsite", description: "Mali obiteljski kamp uz seosko domaćinstvo i vinariju kraj Bjelovara." },
  { id: "camp-omisalj", county_id: "primorje-gorski-kotar", name: "Kamp Omišalj", type: "campsite", description: "Kamp na samom ulazu na otok Krk s pješčanom plažom i bazenom." },
  { id: "camp-krk-premium", county_id: "primorje-gorski-kotar", name: "Krk Premium Camping Resort", type: "campsite", description: "Eko-kamp uz povijesni grad Krk, s wellnessom, bazenima i sportskim terenima." },
  { id: "camp-jezevac", county_id: "primorje-gorski-kotar", name: "Ježevac Premium Camping Resort", type: "campsite", description: "Kamp uz staru jezgru grada Krka, okružen gustom borovom šumom i plažama." },
  { id: "camp-baska-beach", county_id: "primorje-gorski-kotar", name: "Baška Beach Camping Resort", type: "campsite", description: "Kamp uz dugu šljunčanu Velu plažu u Baški na otoku Krku." },
  { id: "camp-slatina-cres", county_id: "primorje-gorski-kotar", name: "Kamp Slatina", type: "campsite", description: "Kamp na otoku Cresu (Martinšćica), prilagođen boravku s kućnim ljubimcima." },
  { id: "camp-san-marino-rab", county_id: "primorje-gorski-kotar", name: "San Marino Camping Resort", type: "campsite", description: "Kamp na otoku Rabu uz čuvenu pješčanu Rajsku plažu, idealan za obitelji." },
  { id: "camp-slamni", county_id: "primorje-gorski-kotar", name: "Camping Slamni", type: "campsite", description: "Butik obiteljski kamp u Dobrinju na Krku, uz ljekovito blato uvale Soline." },
  { id: "camp-cikat", county_id: "primorje-gorski-kotar", name: "Kamp Čikat", type: "campsite", description: "Kamp u borovoj šumi uvale Čikat na Lošinju, s aquaparkom i obiteljskim sadržajem." },
  { id: "camp-poljana", county_id: "primorje-gorski-kotar", name: "Camping Baia Holiday Poljana", type: "campsite", description: "Kamp na najužem dijelu otoka Lošinja, okružen morem s obiju strana." },
  { id: "camp-jankovac", county_id: "virovitica-podravina", name: "Planinski kamp Jankovac", type: "campsite", description: "Planinski eko-kamp na Papuku kod izletišta Jankovac, uz slapove i staze." },
  { id: "camp-duboka", county_id: "pozega-slavonia", name: "Eko-kamp Duboka (Velika)", type: "campsite", description: "Prvi eko-kamp kontinentalne Hrvatske, na južnim padinama Papuka u Velikoj." },
  { id: "camp-petnja", county_id: "brod-posavina", name: "Kamp Petnja", type: "campsite", description: "Mirni kamp uz slikovito jezero Petnja pod Dilj gorom, omiljen kod ribolovaca." },
  { id: "camp-plitvice-holiday", county_id: "lika-senj", name: "Plitvice Holiday Resort", type: "campsite", description: "Kamp i resort blizu Plitvica s glampingom u kućicama na drveću i jezeru." },
  { id: "camp-big-bear-plitvice", county_id: "lika-senj", name: "Big Bear Plitvice Resort", type: "campsite", description: "Ugodan butik kamp u prirodi petnaestak minuta od Plitvičkih jezera." },
  { id: "camp-suza-baranje", county_id: "osijek-baranja", name: "Kamp Suza Baranje", type: "campsite", description: "Mali gostoljubivi kamp u baranjskom selu Suza, baza za vinske podrume." },
  { id: "camp-zaton-resort", county_id: "zadar", name: "Zaton Holiday Resort", type: "campsite", description: "Veliki kamp u Ninu (Zaton) s golemim bazenskim kompleksom i pješčanom plažom." },
  { id: "camp-falkensteiner-zadar", county_id: "zadar", name: "Falkensteiner Premium Camping Zadar", type: "campsite", description: "Luksuzni kamp u Zadru (Borik), otvoren cijele godine, s wellnessom i bazenom." },
  { id: "camp-avalona", county_id: "zadar", name: "Aminess Avalona Camping Resort", type: "campsite", description: "Luksuzni kamp na otoku Pagu (Povljana) sa smještajem uz privatne bazene." },
  { id: "camp-ljutic", county_id: "zadar", name: "Campsite Ljutić", type: "campsite", description: "Obiteljski kamp uz more i šljunčanu plažu u Biogradu na Moru." },
  { id: "camp-stine", county_id: "zadar", name: "Camp Stine", type: "campsite", description: "Manji kamp u Pakoštanima s hladom borova i izravnim pristupom plaži." },
  { id: "camp-miocic", county_id: "zadar", name: "Camp Miočić", type: "campsite", description: "Mirni obiteljski kamp u Rtini kod Zadra, poznat po domaćoj hrani." },
  { id: "camp-phalaris", county_id: "zadar", name: "Terra Park Phalaris", type: "campsite", description: "Kamping resort na sjeveru otoka Paga uz kristalno more, s luksuznim parcelama." },
  { id: "camp-kanic", county_id: "zadar", name: "Camp Kanić", type: "campsite", description: "Mali mirni kamp u uvali Kanić na Pagu, okružen stoljetnim maslinama." },
  { id: "camp-spiritos", county_id: "zadar", name: "Terra Park SpiritoS", type: "campsite", description: "Prostrani kamp na Pagu uz dugu pješčanu plažu s pogledom na Velebit." },
  { id: "camp-jezera-lovisca", county_id: "sibenik-knin", name: "Kamp Jezera Lovišća (Murter)", type: "campsite", description: "Kamp u mirnoj uvali na otoku Murteru s plitkim morem i vlastitom marinom." },
  { id: "camp-dunav-ilok", county_id: "vukovar-srijem", name: "Kamp Dunav (Ilok)", type: "campsite", description: "Mali ugodni kamp na obali Dunava u Iloku, blizu iločkih vinarija." },
  { id: "camp-stobrec-split", county_id: "split-dalmatia", name: "Kamp Stobreč Split", type: "campsite", description: "Kamp na šumovitom poluotoku kraj Splita s dvije šljunčane plaže i wellnessom." },
  { id: "camp-galeb-omis", county_id: "split-dalmatia", name: "Kamp Galeb (Omiš)", type: "campsite", description: "Obiteljski kamp na pješčanoj plaži u Omišu, uz ušće rijeke Cetine." },
  { id: "camp-belvedere-trogir", county_id: "split-dalmatia", name: "Kamp Belvedere (Seget Vranjica)", type: "campsite", description: "Terasasti kamp kod Trogira s pogledom na jadranske otoke i bazenom." },
  { id: "camp-bunja-brac", county_id: "split-dalmatia", name: "Boutique Camping Bunja (Brač)", type: "campsite", description: "Butik kamp u Supetru na Braču, intiman smještaj pod borovima uz more." },
  { id: "camp-amadria-trogir", county_id: "split-dalmatia", name: "Camping Amadria Park Trogir", type: "campsite", description: "Kamp u Segetu Vranjici kod Trogira, uz borovu šumu i šljunčanu plažu." },
  { id: "camp-lanterna", county_id: "istria", name: "Valamar Camping Lanterna", type: "campsite", description: "Jedan od najvećih europskih kampova, kod Poreča, s vodenim parkom i glampingom." },
  { id: "camp-park-umag", county_id: "istria", name: "Camping Park Umag", type: "campsite", description: "Obiteljski kamp na sjeveru Istre s bazenskim kompleksom i dugom uređenom plažom." },
  { id: "camp-istra-funtana", county_id: "istria", name: "Istra Premium Camping Resort (Funtana)", type: "campsite", description: "Luksuzni kamp kod Funtane s privatnim bazenima i aquaparkom Aquamar." },
  { id: "camp-mon-perin", county_id: "istria", name: "Camping Resort Mon Perin (Bale)", type: "campsite", description: "Kamp kod povijesnog mjesta Bale s dugom netaknutom obalom i paleo-parkom." },
  { id: "camp-san-servolo", county_id: "istria", name: "San Servolo Wellness Camping (Buje)", type: "campsite", description: "Butik wellness kamp u unutrašnjosti Istre kod Buja, s privatnim hidromasažama." },
  { id: "camp-sirena-novigrad", county_id: "istria", name: "Aminess Planet Camping Sirena", type: "campsite", description: "Uređen kamp u Novigradu uz more, u naručju borove šume." },
  { id: "camp-maravea", county_id: "istria", name: "Aminess Planet Camping Maravea Resort", type: "campsite", description: "Kamping resort u Novigradu okružen vinogradima i maslinicima." },
  { id: "camp-kanegra", county_id: "istria", name: "FKK Naturist Campsite Kanegra", type: "campsite", description: "Tradicionalni naturistički kamp u skrivenoj uvali Kanegra kod Umaga." },
  { id: "camp-savudrija", county_id: "istria", name: "Campsite Savudrija", type: "campsite", description: "Mirni kamp u Savudriji, podno najstarijeg aktivnog svjetionika na Jadranu." },
  { id: "camp-vestar", county_id: "istria", name: "Campsite Veštar (Rovinj)", type: "campsite", description: "Kamp u mirnoj uvali s pješčanom plažom kod Rovinja, idealan za obitelji." },
  { id: "camp-santa-marina", county_id: "istria", name: "Boutique Campsite Santa Marina", type: "campsite", description: "Mali luksuzni kamp na poluotoku Lanterna kod Tar-Vabrige, s glampingom." },
  { id: "camp-valalta", county_id: "istria", name: "Naturist Camping Valalta", type: "campsite", description: "Nagrađivani naturistički kamp na ulazu u Limski zaljev kod Rovinja." },
  { id: "camp-marina-labin", county_id: "istria", name: "Valamar Camping Marina (Labin)", type: "campsite", description: "Specijalizirani ronilački kamp u Svetoj Marini kod Labina s bogatim podmorjem." },
  { id: "camp-bijela-uvala", county_id: "istria", name: "Camping Bijela Uvala", type: "campsite", description: "Veliki kamp u Funtani (Zelena laguna) kod Poreča, s više bazena i plažama." },
  { id: "camp-polidor", county_id: "istria", name: "Polidor Camping Resort", type: "campsite", description: "Obiteljski kamp u Funtani, otvoren cijele godine, s opuštenim ugođajem." },
  { id: "camp-val-saline", county_id: "istria", name: "Camp Val Saline", type: "campsite", description: "Kamp uz uvalu Saline kod Rovinja, s uređenim parcelama tik uz more." },
  { id: "camp-banki-green", county_id: "istria", name: "Campsite Banki Green Istrian Village", type: "campsite", description: "Mali kontinentalno-mediteranski wellness kamp u unutrašnjosti Istre." },
  { id: "camp-nevio-orebic", county_id: "dubrovnik-neretva", name: "Kamp Nevio (Orebić)", type: "campsite", description: "Obiteljski kamp u Orebiću na Pelješcu, na terasama uz pješčanu plažu." },
  { id: "camp-lupis-loviste", county_id: "dubrovnik-neretva", name: "Kamp Lupis (Lovište)", type: "campsite", description: "Mali ekološki butik kamp u uvali Lovište na zapadnom vrhu Pelješca." },
  { id: "camp-lavanda-orebic", county_id: "dubrovnik-neretva", name: "Kamp Lavanda (Orebić)", type: "campsite", description: "Kamp kod Orebića s pogledom na Korčulu, među maslinicima i lavandom." },
  { id: "camp-toplice-svetimartin", county_id: "medimurje", name: "Kamp Toplice Sveti Martin", type: "campsite", description: "Moderni kamp uz Terme Sveti Martin, u zelenom brežuljkastom Međimurju." },
];

export const POI_TYPES: Record<
  PoiType,
  { label: string; icon: string; color: string }
> = {
  city: { label: "City / Town", icon: "🏙️", color: "#6366F1" },
  mountain: { label: "Mountain", icon: "⛰️", color: "#78716C" },
  lake: { label: "Lake", icon: "💧", color: "#0EA5E9" },
  river: { label: "River", icon: "🌊", color: "#06B6D4" },
  national_park: { label: "National Park", icon: "🌲", color: "#16A34A" },
  nature: { label: "Nature / Park", icon: "🍃", color: "#22C55E" },
  island: { label: "Island", icon: "🏝️", color: "#F59E0B" },
  campsite: { label: "Campsite", icon: "⛺", color: "#EA580C" },
  landmark: { label: "Landmark", icon: "🏛️", color: "#8B5CF6" },
};

export function getVisitedPercent(
  countyId: string,
  poiDataMap: POIDataMap,
): number {
  const countyPois = POIS.filter((p) => p.county_id === countyId);
  if (countyPois.length === 0) return 0;
  const visited = countyPois.filter(
    (p) => poiDataMap[p.id]?.status === "visited",
  ).length;
  return Math.round((visited / countyPois.length) * 100);
}

export function getGradientColor(percent: number): string {
  if (percent === 0) return "#334155";
  if (percent <= 25) {
    const t = percent / 25;
    return interpolateColor("#334155", "#1D4ED8", t);
  }
  if (percent <= 50) {
    const t = (percent - 25) / 25;
    return interpolateColor("#1D4ED8", "#D97706", t);
  }
  if (percent <= 75) {
    const t = (percent - 50) / 25;
    return interpolateColor("#D97706", "#16A34A", t);
  }
  const t = (percent - 75) / 25;
  return interpolateColor("#16A34A", "#15803D", t);
}

function interpolateColor(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Cities ──────────────────────────────────────────────────────────
// Cities are first-class, clickable entities: drawn as markers on the map (revealed by zoom
// according to their `importance` tier), listed inside their county's panel, and each opening
// its own detail panel with a cover image and its own list of places to visit.

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

/** Lowest map zoom level at which a city of each importance tier becomes visible. */
export const CITY_MIN_ZOOM: Record<CityImportance, number> = { 1: 7, 2: 8, 3: 10 };

export const CITIES: City[] = [
  // Tier 1 — najveći gradovi, uvijek vidljivi na karti
  { id: "zagreb", name: "Zagreb", county_id: "zagreb-city", lat: 45.815, lng: 15.982, importance: 1, description: "Glavni grad Hrvatske: barokni Gornji grad, živahne kavane, muzeji i tržnica Dolac." },
  { id: "split", name: "Split", county_id: "split-dalmatia", lat: 43.5081, lng: 16.4403, importance: 1, description: "Živo srce Dalmacije, izraslo u i oko Dioklecijanove rimske palače." },
  { id: "rijeka", name: "Rijeka", county_id: "primorje-gorski-kotar", lat: 45.3271, lng: 14.4422, importance: 1, description: "Najveća hrvatska luka i Europska prijestolnica kulture 2020. na Kvarneru." },
  { id: "osijek", name: "Osijek", county_id: "osijek-baranja", lat: 45.555, lng: 18.6955, importance: 1, description: "Zelena slavonska metropola na Dravi, poznata po baroknoj Tvrđi." },
  { id: "zadar", name: "Zadar", county_id: "zadar", lat: 44.1194, lng: 15.2314, importance: 1, description: "Drevni grad na moru, dom Morskih orgulja i jednog od najljepših zalazaka sunca." },
  { id: "dubrovnik", name: "Dubrovnik", county_id: "dubrovnik-neretva", lat: 42.6507, lng: 18.0944, importance: 1, description: "'Biser Jadrana': grad-tvrđava od blistavog kamena pod zaštitom UNESCO-a." },
  { id: "pula", name: "Pula", county_id: "istria", lat: 44.8666, lng: 13.8496, importance: 1, description: "Najveći istarski grad, okružen jednim od najočuvanijih rimskih amfiteatara." },

  // Tier 2 — regionalna središta
  { id: "sibenik", name: "Šibenik", county_id: "sibenik-knin", lat: 43.735, lng: 15.895, importance: 2, description: "Dalmatinski grad strmih kamenih ulica i UNESCO katedrale sv. Jakova." },
  { id: "varazdin", name: "Varaždin", county_id: "varazdin", lat: 46.3057, lng: 16.3366, importance: 2, description: "Barokni biser i nekadašnja prijestolnica, s bijelim Starim gradom." },
  { id: "karlovac", name: "Karlovac", county_id: "karlovac", lat: 45.4929, lng: 15.5553, importance: 2, description: "Grad na četiri rijeke, izgrađen u obliku zvijezde, vrata gorja i mora." },
  { id: "rovinj", name: "Rovinj", county_id: "istria", lat: 45.0812, lng: 13.6384, importance: 2, description: "Najromantičniji istarski grad; šarene se kuće spuštaju moru pod crkvom sv. Eufemije." },
  { id: "porec", name: "Poreč", county_id: "istria", lat: 45.2272, lng: 13.5947, importance: 2, description: "Obalni grad rimskog rastera, poznat po zlatnim mozaicima Eufrazijeve bazilike." },
  { id: "sisak", name: "Sisak", county_id: "sisak-moslavina", lat: 45.4851, lng: 16.3734, importance: 2, description: "Povijesni grad na ušću Kupe u Savu, s trokutastom renesansnom tvrđavom." },
  { id: "slavonski-brod", name: "Slavonski Brod", county_id: "brod-posavina", lat: 45.1631, lng: 18.0142, importance: 2, description: "Posavski grad koji čuva jednu od najvećih baroknih tvrđava u Europi." },
  { id: "vukovar", name: "Vukovar", county_id: "vukovar-srijem", lat: 45.3491, lng: 19.0031, importance: 2, description: "Dunavski grad sjećanja i obnove, s baroknom jezgrom koja oživljava." },
  { id: "cakovec", name: "Čakovec", county_id: "medimurje", lat: 46.3844, lng: 16.4339, importance: 2, description: "Središte Međimurja, oko renesansnog Staroga grada obitelji Zrinski." },
  { id: "gospic", name: "Gospić", county_id: "lika-senj", lat: 44.5461, lng: 15.3748, importance: 2, description: "Glavni grad ličke visoravni, polazište za Velebit i zavičaj Nikole Tesle." },
  { id: "knin", name: "Knin", county_id: "sibenik-knin", lat: 44.0333, lng: 16.1961, importance: 2, description: "Grad pod velikom srednjovjekovnom tvrđavom, nekoć sjedište hrvatskih kraljeva." },
  { id: "bjelovar", name: "Bjelovar", county_id: "bjelovar-bilogora", lat: 45.8988, lng: 16.8424, importance: 2, description: "Planski građen garnizonski grad 18. stoljeća s velikim središnjim trgom." },
  { id: "koprivnica", name: "Koprivnica", county_id: "koprivnica-krizevci", lat: 46.1628, lng: 16.8314, importance: 2, description: "Podravski grad biciklizma, dom tvrtke Podravka i naivne umjetnosti." },
  { id: "pozega", name: "Požega", county_id: "pozega-slavonia", lat: 45.3403, lng: 17.6853, importance: 2, description: "Grad 'Zlatne doline' s baroknim crkvama u srcu slavonskih vinograda." },
  { id: "virovitica", name: "Virovitica", county_id: "virovitica-podravina", lat: 45.8317, lng: 17.3856, importance: 2, description: "Slavonski grad na Dravi, poznat po obnovljenom dvorcu Pejačević." },
  { id: "krapina", name: "Krapina", county_id: "krapina-zagorje", lat: 46.1608, lng: 15.8789, importance: 2, description: "Zagorski grad uz svjetski poznato nalazište i muzej krapinskih neandertalaca." },
  { id: "velika-gorica", name: "Velika Gorica", county_id: "zagreb-county", lat: 45.7133, lng: 16.0725, importance: 2, description: "Grad Turopolja južno od Zagreba, uz Zračnu luku Franjo Tuđman." },
  { id: "dakovo", name: "Đakovo", county_id: "osijek-baranja", lat: 45.3081, lng: 18.4111, importance: 2, description: "Grad veličanstvene katedrale biskupa Strossmayera i uzgoja lipicanaca." },

  // Tier 3 — manji gradovi, vidljivi tek pri približavanju
  { id: "samobor", name: "Samobor", county_id: "zagreb-county", lat: 45.8021, lng: 15.7118, importance: 3, description: "Ljupki izletnički gradić kraj Zagreba, poznat po kremšnitama." },
  { id: "jastrebarsko", name: "Jastrebarsko", county_id: "zagreb-county", lat: 45.6714, lng: 15.6517, importance: 3, description: "Jaska u podnožju Plešivice, poznata po pjenušcima i dvorcu Erdödy." },
  { id: "marija-bistrica", name: "Marija Bistrica", county_id: "krapina-zagorje", lat: 46.0028, lng: 16.1186, importance: 3, description: "Najveće hrvatsko marijansko svetište i hodočasničko središte Zagorja." },
  { id: "zabok", name: "Zabok", county_id: "krapina-zagorje", lat: 46.0292, lng: 15.9122, importance: 3, description: "Prometno i gospodarsko središte Krapinsko-zagorske županije." },
  { id: "kutina", name: "Kutina", county_id: "sisak-moslavina", lat: 45.4822, lng: 16.7811, importance: 3, description: "Središte Moslavine uz Park prirode Lonjsko polje." },
  { id: "ogulin", name: "Ogulin", county_id: "karlovac", lat: 45.2661, lng: 15.2239, importance: 3, description: "Grad bajki pod Klekom, zavičaj Ivane Brlić-Mažuranić." },
  { id: "slunj", name: "Slunj", county_id: "karlovac", lat: 45.1169, lng: 15.5878, importance: 3, description: "Gradić nad slapovima Slunjčice i slikovitim mlinicama Rastoka." },
  { id: "ivanec", name: "Ivanec", county_id: "varazdin", lat: 46.2239, lng: 16.1217, importance: 3, description: "Grad u podnožju Ivanščice na sjeverozapadu Hrvatske." },
  { id: "krizevci", name: "Križevci", county_id: "koprivnica-krizevci", lat: 46.0225, lng: 16.5422, importance: 3, description: "Stari podravski grad barokne arhitekture i tradicije Križevačkog spravišča." },
  { id: "daruvar", name: "Daruvar", county_id: "bjelovar-bilogora", lat: 45.5922, lng: 17.225, importance: 3, description: "Toplički grad poznat po termama, vinima i češkoj manjini." },
  { id: "opatija", name: "Opatija", county_id: "primorje-gorski-kotar", lat: 45.3376, lng: 14.3052, importance: 3, description: "Lječilište belle époque s raskošnim vilama i 12 km dugom šetnicom Lungomare." },
  { id: "krk", name: "Krk", county_id: "primorje-gorski-kotar", lat: 45.0259, lng: 14.5731, importance: 3, description: "Stari grad koji je dao ime najvećem hrvatskom otoku, mostom povezanom s kopnom." },
  { id: "cres", name: "Cres", county_id: "primorje-gorski-kotar", lat: 44.9612, lng: 14.4079, importance: 3, description: "Stari kvarnerski gradić na otoku bjeloglavih supova i slatkovodnog Vranskog jezera." },
  { id: "mali-losinj", name: "Mali Lošinj", county_id: "primorje-gorski-kotar", lat: 44.5317, lng: 14.4683, importance: 3, description: "Najveći otočni grad, 'otok vitalnosti' s borovom uvalom Čikat." },
  { id: "senj", name: "Senj", county_id: "lika-senj", lat: 44.9894, lng: 14.9058, importance: 3, description: "Vjetroviti primorski grad uskoka, pod tvrđavom Nehaj." },
  { id: "novalja", name: "Novalja", county_id: "lika-senj", lat: 44.5562, lng: 14.8842, importance: 3, description: "Ljetovalište na otoku Pagu, poznato po plaži Zrće i noćnom životu." },
  { id: "slatina", name: "Slatina", county_id: "virovitica-podravina", lat: 45.7025, lng: 17.7022, importance: 3, description: "Podravski grad parkova i dvoraca na rubu Papuka." },
  { id: "pakrac", name: "Pakrac", county_id: "pozega-slavonia", lat: 45.4372, lng: 17.1894, importance: 3, description: "Zapadnoslavonski grad koji se obnavlja, između Psunja i Papuka." },
  { id: "nova-gradiska", name: "Nova Gradiška", county_id: "brod-posavina", lat: 45.2536, lng: 17.3828, importance: 3, description: "Posavski grad u podnožju Psunja, uz Savu i autocestu." },
  { id: "nasice", name: "Našice", county_id: "osijek-baranja", lat: 45.4922, lng: 18.0908, importance: 3, description: "Slavonski grad oko dvorca Pejačević, na obroncima Krndije." },
  { id: "vinkovci", name: "Vinkovci", county_id: "vukovar-srijem", lat: 45.2878, lng: 18.8058, importance: 3, description: "Jedan od najstarijih neprekidno naseljenih gradova u Europi, u srcu Slavonije." },
  { id: "ilok", name: "Ilok", county_id: "vukovar-srijem", lat: 45.2239, lng: 19.3708, importance: 3, description: "Najistočniji hrvatski grad, dunavsko vinsko središte oko dvorca Odescalchi." },
  { id: "biograd", name: "Biograd na Moru", county_id: "zadar", lat: 43.9376, lng: 15.4419, importance: 3, description: "Nekadašnja hrvatska kraljevska luka, danas ljetovalište i marina." },
  { id: "nin", name: "Nin", county_id: "zadar", lat: 44.2406, lng: 15.1808, importance: 3, description: "Najstariji hrvatski kraljevski grad na otočiću, okružen plitkim pješčanim plažama." },
  { id: "pag", name: "Pag", county_id: "zadar", lat: 44.4447, lng: 15.0561, importance: 3, description: "Grad na 'mjesečevom' otoku, poznat po paškom siru, čipki i soli." },
  { id: "vodice", name: "Vodice", county_id: "sibenik-knin", lat: 43.7547, lng: 15.7794, importance: 3, description: "Popularno šibensko ljetovalište živahne rive i noćnog života." },
  { id: "skradin", name: "Skradin", county_id: "sibenik-knin", lat: 43.8172, lng: 15.9228, importance: 3, description: "Ljupki gradić na rijeci Krki i polazište za njezine slapove." },
  { id: "trogir", name: "Trogir", county_id: "split-dalmatia", lat: 43.5164, lng: 16.2502, importance: 3, description: "UNESCO otok-grad uskih kamenih uličica s vrhunskim portalom katedrale." },
  { id: "makarska", name: "Makarska", county_id: "split-dalmatia", lat: 43.2936, lng: 17.0197, importance: 3, description: "Živahno ljetovalište u uvali s palmama pod moćnim Biokovom." },
  { id: "omis", name: "Omiš", county_id: "split-dalmatia", lat: 43.4442, lng: 16.6886, importance: 3, description: "Nekadašnje gusarsko uporište gdje kanjon Cetine izbija na more." },
  { id: "hvar", name: "Hvar", county_id: "split-dalmatia", lat: 43.1729, lng: 16.4428, importance: 3, description: "Glamurozni otočni grad s najvećim trgom u Dalmaciji i tvrđavom Fortica." },
  { id: "metkovic", name: "Metković", county_id: "dubrovnik-neretva", lat: 43.0542, lng: 17.6483, importance: 3, description: "Grad u delti Neretve, poznat po mandarinama i ornitološkom rezervatu." },
  { id: "korcula", name: "Korčula", county_id: "dubrovnik-neretva", lat: 42.9614, lng: 17.1356, importance: 3, description: "Utvrđeni grad na otoku Korčuli, po legendi rodno mjesto Marka Pola." },
  { id: "ston", name: "Ston", county_id: "dubrovnik-neretva", lat: 42.8394, lng: 17.6961, importance: 3, description: "Vrata Pelješca, poznata po najduljim zidinama Europe, solani i kamenicama." },
  { id: "umag", name: "Umag", county_id: "istria", lat: 45.4375, lng: 13.5244, importance: 3, description: "Najzapadniji hrvatski grad, istarsko središte tenisa i maslinova ulja." },
  { id: "motovun", name: "Motovun", county_id: "istria", lat: 45.3367, lng: 13.8281, importance: 3, description: "Utvrđeni gradić na brdu iznad doline Mirne, poznat po tartufima i festivalu." },
  { id: "pazin", name: "Pazin", county_id: "istria", lat: 45.2403, lng: 13.9389, importance: 3, description: "Središte istarske unutrašnjosti, nad ponorom koji je nadahnuo Julesa Vernea." },
  { id: "prelog", name: "Prelog", county_id: "medimurje", lat: 46.3422, lng: 16.6139, importance: 3, description: "Drugi grad Međimurja, uz rijeku Dravu i njezina jezera." },
];

/**
 * Which city each POI belongs to (its "places to visit"). POIs left out here stay county-level
 * (nature, national parks, islands, campsites…) and show directly in the county panel.
 * Kept as a separate map so the POIS array above stays untouched.
 */
const POI_CITY_ID: Record<string, string> = {
  // Zagreb
  "zagreb-city-center": "zagreb",
  "zagreb-jarun": "zagreb",
  "zagreb-maksimir": "zagreb",
  "zagreb-bundek": "zagreb",
  "zagreb-lotrscak": "zagreb",
  // Samobor
  "samobor-town": "samobor",
  // Krapina
  "krapina-neanderthal": "krapina",
  // Varaždin
  "varazdin-old-town": "varazdin",
  "varazdin-castle": "varazdin",
  "varazdin-cemetery": "varazdin",
  // Koprivnica
  "koprivnica-city": "koprivnica",
  // Bjelovar
  "bjelovar-city": "bjelovar",
  // Sisak
  "sisak-fortress": "sisak",
  // Karlovac
  "karlovac-city": "karlovac",
  // Rijeka / Opatija / Krk
  "rijeka-city": "rijeka",
  "opatija-riviera": "opatija",
  "krk-island": "krk",
  // Gospić
  "gospic-city": "gospic",
  // Virovitica
  "virovitica-city": "virovitica",
  // Požega
  "pozega-city": "pozega",
  // Slavonski Brod
  "slavonski-brod-city": "slavonski-brod",
  "brod-fortress": "slavonski-brod",
  // Zadar / Nin
  "zadar-old-town": "zadar",
  "zadar-forum": "zadar",
  "nin-city": "nin",
  // Osijek
  "osijek-city": "osijek",
  "osijek-tvrdja": "osijek",
  // Šibenik / Knin / Skradin
  "sibenik-city": "sibenik",
  "knin-fortress": "knin",
  "skradin-town": "skradin",
  // Vukovar / Vinkovci / Ilok
  "vukovar-city": "vukovar",
  "vukovar-water-tower": "vukovar",
  "vinkovci-city": "vinkovci",
  "ilok-city": "ilok",
  // Split / Trogir / Makarska / Omiš / Hvar
  "split-city": "split",
  "diocletian-palace": "split",
  "klis-fortress": "split",
  "split-marjan": "split",
  "trogir-old-town": "trogir",
  "makarska-riviera": "makarska",
  "omis-city": "omis",
  "cetina-river": "omis",
  "hvar-island": "hvar",
  // Pula / Rovinj / Poreč / Motovun / Pazin
  "pula-city": "pula",
  "pula-arena": "pula",
  "rovinj-city": "rovinj",
  "rovinj-euphemia": "rovinj",
  "porec-city": "porec",
  "motovun-hill-town": "motovun",
  "pazin-castle": "pazin",
  // Čakovec
  "cakovec-medimurje": "cakovec",
  // Dubrovnik / Korčula / Ston
  "dubrovnik-city": "dubrovnik",
  "dubrovnik-walls": "dubrovnik",
  "dubrovnik-lovrijenac": "dubrovnik",
  "korcula-island": "korcula",
  "ston-walls": "ston",
  // Existing POIs that map onto the newly added towns (avoids double-listing)
  "velika-gorica": "velika-gorica",
  "ogulin-city": "ogulin",
  "kutina-city": "kutina",
  "senj-nehaj": "senj",
  "daruvar-spa": "daruvar",
  "krizevci-city": "krizevci",
  // Campsites attached to a city
  "camp-korana": "slunj",
  "camp-vinia": "bjelovar",
  "camp-krk-premium": "krk",
  "camp-jezevac": "krk",
  "camp-cikat": "mali-losinj",
  "camp-slatina-cres": "cres",
  "camp-poljana": "mali-losinj",
  "camp-zaton-resort": "nin",
  "camp-falkensteiner-zadar": "zadar",
  "camp-avalona": "pag",
  "camp-ljutic": "biograd",
  "camp-phalaris": "pag",
  "camp-kanic": "pag",
  "camp-spiritos": "pag",
  "camp-dunav-ilok": "ilok",
  "camp-stobrec-split": "split",
  "camp-galeb-omis": "omis",
  "camp-belvedere-trogir": "trogir",
  "camp-amadria-trogir": "trogir",
  "camp-lanterna": "porec",
  "camp-park-umag": "umag",
  "camp-kanegra": "umag",
  "camp-savudrija": "umag",
  "camp-vestar": "rovinj",
  "camp-valalta": "rovinj",
  "camp-bijela-uvala": "porec",
  "camp-val-saline": "rovinj",
};

const cityById = Object.fromEntries(CITIES.map((c) => [c.id, c]));

export function getCity(cityId: string): City | undefined {
  return cityById[cityId];
}

/** Cover image path for a city, falling back to the `/cities/<id>.jpg` convention. */
export function cityCover(city: City): string {
  return city.coverImage ?? `/cities/${city.id}.jpg`;
}

/** Cities inside a county, ordered by importance (major first). */
export function citiesForCounty(countyId: string): City[] {
  return CITIES.filter((c) => c.county_id === countyId).sort(
    (a, b) => a.importance - b.importance,
  );
}

/** The POIs that make up a city's "places to visit" list. */
export function poisForCity(cityId: string): POI[] {
  return POIS.filter((p) => POI_CITY_ID[p.id] === cityId);
}

/** County POIs that are NOT tied to a city (shown directly in the county panel). */
export function looseCountyPois(countyId: string): POI[] {
  return POIS.filter((p) => p.county_id === countyId && !POI_CITY_ID[p.id]);
}

/** A city's own explored percentage, from the status of its places to visit. */
export function getCityPercent(cityId: string, poiDataMap: POIDataMap): number {
  const pois = poisForCity(cityId);
  if (pois.length === 0) return 0;
  const visited = pois.filter((p) => poiDataMap[p.id]?.status === "visited").length;
  return Math.round((visited / pois.length) * 100);
}
