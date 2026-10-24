import { describe, expect, it } from "vitest";
import { fullMatch, matchScore, normalizeText, similarWords } from "./text";

describe("normalizeText", () => {
  it("drops case, diacritics (including đ) and punctuation", () => {
    expect(normalizeText("Đakovo, Šibenik-Knin!")).toBe("dakovo sibenik knin");
  });
});

describe("similarWords", () => {
  it("absorbs Croatian case endings, including stem changes", () => {
    expect(similarWords("osijeku", "osijek")).toBe(true);
    expect(similarWords("rijeci", "rijeka")).toBe(true); // k -> c
    expect(similarWords("zadru", "zadar")).toBe(true); // dropped vowel
    expect(similarWords("plitvicka", "plitvice")).toBe(true); // adjective from the name
  });

  it("keeps different names apart", () => {
    expect(similarWords("zagreb", "zagorje")).toBe(false);
    expect(similarWords("split", "pula")).toBe(false);
  });
});

describe("matchScore", () => {
  it("matches spoken text without diacritics", () => {
    expect(matchScore("Đakovo", "dakovo")).toBe(1);
  });

  it("ranks an exact word above a prefix match ('krka': Krka over Krk)", () => {
    expect(matchScore("Krka National Park", "krka")).toBeGreaterThan(matchScore("Krk", "krka"));
  });

  it("matches Croatian geographic words against English names", () => {
    expect(fullMatch("Plitvice Lakes NP", "Plitvička jezera")).toBe(true);
    expect(matchScore("Hvar Island", "otok Hvar")).toBe(1);
  });

  it("gives partial credit when only some words match", () => {
    expect(matchScore("Krka National Park", "Krka slapovi")).toBe(0.5);
  });

  it("ignores short words like 'i' ('and') instead of matching everything with them", () => {
    expect(matchScore("Krka i Skradin", "istra")).toBe(0);
  });

  it("is 0 for an empty query", () => {
    expect(matchScore("Split", "")).toBe(0);
  });
});
