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

export const TOWNS: PlaceMarker[] = [
  { name: "Zagreb", lat: 45.815, lng: 15.982 },
  { name: "Split", lat: 43.508, lng: 16.44 },
  { name: "Rijeka", lat: 45.327, lng: 14.442 },
  { name: "Osijek", lat: 45.555, lng: 18.695 },
];

export const MOUNTAINS: PlaceMarker[] = [
  { name: "Papuk", lat: 45.517, lng: 17.683 },
  { name: "Velebit", lat: 44.533, lng: 15.3 },
  { name: "Dinara", lat: 43.958, lng: 16.388 },
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
