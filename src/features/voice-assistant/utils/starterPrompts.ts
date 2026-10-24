import {
  REGIONS,
  regionExploredPercent,
  type RegionId,
} from "@/features/voice-assistant/tools/regions";

/**
 * Every primary region, in tie-break order for equally explored ones (e.g. a brand-new user, where all
 * are 0 %): lead with the places people tend to overlook, not with the capital
 */
const TIE_ORDER: RegionId[] = [
  "slavonija",
  "lika",
  "dalmacija",
  "istra_kvarner",
  "sjeverna",
  "sredisnja",
  "zagreb",
];

/**
 * Suggested first questions for the voice panel, personalised from the user's progress: the emptiest
 * region gets a recommendation prompt, the next one a weekend-trip prompt. They are sent to the agent
 * as typed messages, so they also work for anyone who can't or doesn't want to speak first
 * Wording is gender-neutral (no "Gdje još nisam bio?")
 */
export function buildStarterPrompts(
  countyPercents: Record<string, number>,
  wishlistCount: number,
): string[] {
  // Array.prototype.sort is stable, so equally explored regions keep TIE_ORDER
  const ranked = [...TIE_ORDER].sort(
    (a, b) => regionExploredPercent(a, countyPercents) - regionExploredPercent(b, countyPercents),
  );
  const [emptiest, next] = ranked;

  return [
    "Što mi još nedostaje na karti?",
    `Preporuči mi nešto ${REGIONS[emptiest].inLabel}`,
    `Vikend izlet blizu ${REGIONS[next].nearLabel}`,
    wishlistCount > 0 ? "Što imam na listi želja?" : "Koji su najljepši nacionalni parkovi?",
  ];
}
