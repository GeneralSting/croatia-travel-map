import { describe, expect, it } from "vitest";
import { PRIMARY_REGION_IDS, regionExploredPercent, regionOfCounty, REGIONS } from "./regions";

describe("regions", () => {
  it("puts every county of a primary region in exactly one region", () => {
    const counties = PRIMARY_REGION_IDS.flatMap((id) => [...REGIONS[id].counties]);
    expect(new Set(counties).size).toBe(counties.length); // no county twice
    expect(counties).toHaveLength(21); // all of Croatia's counties
  });

  it("finds a county's primary region, never the overlapping 'obala'", () => {
    expect(regionOfCounty("split-dalmatia")).toBe("dalmacija");
    expect(regionOfCounty("osijek-baranja")).toBe("slavonija");
  });

  it("averages a region's counties so an empty county isn't hidden by a full one", () => {
    expect(regionExploredPercent("istra_kvarner", { istria: 80, "primorje-gorski-kotar": 0 })).toBe(40);
    expect(regionExploredPercent("lika", {})).toBe(0);
  });
});
