import { describe, expect, it } from "vitest";
import { buildStarterPrompts } from "./starterPrompts";

describe("buildStarterPrompts", () => {
  it("for a new user, leads with the overlooked regions", () => {
    expect(buildStarterPrompts({}, 0)).toEqual([
      "Što mi još nedostaje na karti?",
      "Preporuči mi nešto u Slavoniji",
      "Vikend izlet blizu Plitvičkih jezera",
      "Koji su najljepši nacionalni parkovi?",
    ]);
  });

  it("moves on to the next empty region once one has been explored", () => {
    const explored = {
      "osijek-baranja": 100,
      "vukovar-srijem": 100,
      "brod-posavina": 100,
      "pozega-slavonia": 100,
      "virovitica-podravina": 100,
    };
    const prompts = buildStarterPrompts(explored, 0);
    expect(prompts[1]).toBe("Preporuči mi nešto u Lici");
    expect(prompts[2]).toBe("Vikend izlet blizu Splita");
  });

  it("offers the wishlist once it has something on it", () => {
    expect(buildStarterPrompts({}, 3)[3]).toBe("Što imam na listi želja?");
  });
});
