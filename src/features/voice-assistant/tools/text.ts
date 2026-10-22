/**
 * Forgiving text matching for spoken place names. Speech recognition and Croatian grammar both get in
 * the way of exact matches:
 *  - case endings, sometimes with a sound change: Rijeka -> "u Rijeci", Zadar -> "u Zadru"
 *  - adjectives built from names: "Plitvička" for Plitvice
 *  - missing diacritics: "Dakovo" for Đakovo
 *  - Croatian words against English data: "jezera" vs "Plitvice Lakes NP"
 * So matching is diacritic-insensitive, compares words by a shared prefix, and expands a few common
 * geographic words into English
 */

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/đ/g, "d") // đ has no decomposed form, so NFD below wouldn't strip it
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const MIN_WORD = 3; // shorter words ("i", "na", "np") carry no meaning for matching

const words = (text: string) =>
  normalizeText(text)
    .split(" ")
    .filter((word) => word.length >= MIN_WORD);

/**
 * Two words are "the same word" when they share a long enough prefix: at least 3 letters, and at
 * most 2 letters short of the shorter word. That absorbs Croatian endings and stem changes
 * (rijeci/rijeka, zadru/zadar, osijeku/osijek) while keeping different names apart (zagreb/zagorje)
 */
export function similarWords(a: string, b: string): boolean {
  let common = 0;
  while (common < a.length && common < b.length && a[common] === b[common]) common++;
  return common >= Math.max(MIN_WORD, Math.min(a.length, b.length) - 2);
}

/**
 * Common Croatian geographic words -> their English form, since most POI names in the data are
 * English ("Plitvice Lakes NP", "Hvar Island"). "rijeka" (river) is deliberately missing: it would
 * clash with the city of Rijeka
 */
const HR_TO_EN: Record<string, string> = {
  jezero: "lake",
  otok: "island",
  otoci: "islands",
  nacionalni: "national",
  prirode: "nature",
  planina: "mountain",
  slap: "waterfall",
  slapovi: "waterfalls",
  tvrdava: "fortress",
  dvorac: "castle",
  plaza: "beach",
  spilja: "cave",
  kamp: "camp",
  vinska: "wine",
  vino: "wine",
};

// The query word itself plus its English form, when it is (a declined form of) a known word
function variants(word: string): string[] {
  const forms = [word];
  for (const [croatian, english] of Object.entries(HR_TO_EN)) {
    if (similarWords(word, croatian)) forms.push(english);
  }
  return forms;
}

export const queryWords = words;

const EXACT = 1;
const SIMILAR = 0.9; // a prefix match ranks just below an exact one: "krka" prefers Krka over Krk

/** How well one query word matches a text: EXACT, SIMILAR or 0 */
export function wordScore(queryWord: string, textWords: string[]): number {
  let best = 0;
  for (const form of variants(queryWord)) {
    for (const textWord of textWords) {
      if (form === textWord) return EXACT;
      if (similarWords(form, textWord)) best = SIMILAR;
    }
  }
  return best;
}

/**
 * How well `query` matches `text`, from 0 to 1: the average over the query's words. Partial scores
 * let a multi-word query still find a place through the words it shares
 */
export function matchScore(text: string, query: string): number {
  const asked = words(query);
  if (!asked.length) return 0;
  const textWords = words(text);
  return asked.reduce((sum, word) => sum + wordScore(word, textWords), 0) / asked.length;
}

/** True when every word of `query` is found in `text` - used where a partial match would be a guess */
export function fullMatch(text: string, query: string): boolean {
  const asked = words(query);
  const textWords = words(text);
  return asked.length > 0 && asked.every((word) => wordScore(word, textWords) > 0);
}
