import { describe, expect, it } from "vitest";
import { cleanAgentText } from "./transcript";

describe("cleanAgentText", () => {
  it("drops expressive audio tags the voice turns into tone", () => {
    expect(cleanAgentText("[happy] Evo Osijeka!")).toBe("Evo Osijeka!");
    expect(cleanAgentText("Krka je [excited] prekrasna.")).toBe("Krka je prekrasna.");
  });

  it("keeps ordinary text, including numbers in brackets", () => {
    expect(cleanAgentText("Sljeme (1033 m) [1]")).toBe("Sljeme (1033 m) [1]");
  });
});
