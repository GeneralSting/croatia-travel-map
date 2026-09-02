import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMapFilters } from "./useMapFilters";
import type { PoiType } from "@/features/map-explorer/types/types";

/**
 * Hook test: we render the hook in isolation (no component, no map) with renderHook, then drive
 * its actions inside act() and assert the returned state. This verifies the filter logic - the part
 * that decides what's shown without bootin Leaflet.
 */

const TYPES: PoiType[] = ["mountain", "lake", "city"];

describe("useMapFilters", () => {
  it("starts with all types enabled and both toggles on", () => {
    const { result } = renderHook(() => useMapFilters(TYPES));

    expect(result.current.enabledTypes).toEqual({
      mountain: true,
      lake: true,
      city: true,
    });
    expect(result.current.showPoiNames).toBe(true);
    expect(result.current.showCustom).toBe(true);
  });

  it("toggling a type turns just that type off, then back on", () => {
    const { result } = renderHook(() => useMapFilters(TYPES));

    act(() => result.current.toggleType("mountain"));
    expect(result.current.enabledTypes.mountain).toBe(false);
    expect(result.current.enabledTypes.lake).toBe(true); // others untouched

    act(() => result.current.toggleType("mountain"));
    expect(result.current.enabledTypes.mountain).toBe(true);
  });

  it("toggleCustom flips the My Places filter independently of types", () => {
    const { result } = renderHook(() => useMapFilters(TYPES));

    act(() => result.current.toggleCustom());
    expect(result.current.showCustom).toBe(false);
    expect(result.current.enabledTypes.mountain).toBe(true); // type filters unaffected
  });

  it("toggleNames flips the POI name labels", () => {
    const { result } = renderHook(() => useMapFilters(TYPES));

    act(() => result.current.toggleNames());
    expect(result.current.showPoiNames).toBe(false);
  });
});
