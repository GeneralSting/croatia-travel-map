"use client";

import { useEffect, type RefObject } from "react";
import { useMapControlApi } from "@/features/map-explorer";

/**
 * While `element` is shown, tell the map which part of the screen it covers, so the camera frames
 * places (e.g. the agent's highlighted results) in the area that's still visible. Measured, not
 * hard-coded: the floating card on desktop covers the left edge, the bottom sheet on phones the bottom
 * - and both resize with their content
 */
export function useReserveMapArea(element: RefObject<HTMLElement | null>, active: boolean) {
  const store = useMapControlApi();

  useEffect(() => {
    const node = element.current;
    if (!active || !node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const isBottomSheet = rect.width >= window.innerWidth - 1;
      store
        .getState()
        .setCameraInsets(
          isBottomSheet ? { bottom: window.innerHeight - rect.top } : { left: rect.right },
        );
    };

    measure();
    // ResizeObserver: content growth (transcript); window resize: crossing the sm breakpoint
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      store.getState().setCameraInsets(null);
    };
  }, [element, active, store]);
}
