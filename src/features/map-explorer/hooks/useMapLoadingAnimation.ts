import { useEffect, type RefObject } from "react";
import { SEARCH_PATH } from "@/features/map-explorer/constants/searchPath";
import { catmullRom } from "@/features/map-explorer/utils/catmullRom";

interface useMapLoadingAnimationProps {
  magnifierRef: RefObject<HTMLDivElement | null>;
  lensRef: RefObject<HTMLDivElement | null>;
  dotsRef: RefObject<HTMLSpanElement | null>;
  speed: number;
  zoom: number;
  lensRadius: number;
}

/**
 * Persisted across mounts - there's only ever one loader on screen, the loader remounts once when the dynamic-import
 * fallback hands off to the map's own data-loading gate (without this the search animation would restart)
 * Keeping the progress where left out
 */
let pathProgress = 0; // current position index along the search path
let lastTimestamp = 0;

export function useMapLoadingAnimation({
  magnifierRef,
  lensRef,
  dotsRef,
  speed,
  zoom,
  lensRadius,
}: useMapLoadingAnimationProps) {
  useEffect(() => {
    const points = SEARCH_PATH;
    const totalPoints = points.length;

    // Re-anchor the clock on the (re)mount so the first frame - 'pathProgress' itself is not reset
    lastTimestamp = performance.now();
    let animationFrameId = 0;

    const tick = (currentTimestamp: number) => {
      // Calculate delta time in seconds, capped at 50ms to prevent huge jumps on tab-switching
      const deltaTime = Math.min(currentTimestamp - lastTimestamp, 50) / 1000;
      lastTimestamp = currentTimestamp;

      // Update path progress using the speed multiplier
      const progressIncrement = deltaTime * speed * 0.55;
      pathProgress = (pathProgress + progressIncrement) % totalPoints;

      const currentSegmentIndex = Math.floor(pathProgress);
      const segmentInterpolationFactor = pathProgress - currentSegmentIndex;

      // Helper to fetch wrapping points smoothly on the closed loop
      const getPointAtRelativeIndex = (offset: number) => {
        return points[
          (currentSegmentIndex + offset + totalPoints) % totalPoints
        ];
      };

      // Ease within each segment for a realistic dwell-and-dart "searching" feel
      const easedSegmentFactor =
        segmentInterpolationFactor -
        Math.sin(segmentInterpolationFactor * Math.PI * 2) * 0.12;

      // Interpolate the coordinates using Catmull-Rom math
      const currentX = catmullRom(
        getPointAtRelativeIndex(-1)[0],
        getPointAtRelativeIndex(0)[0],
        getPointAtRelativeIndex(1)[0],
        getPointAtRelativeIndex(2)[0],
        easedSegmentFactor,
      );

      const currentY = catmullRom(
        getPointAtRelativeIndex(-1)[1],
        getPointAtRelativeIndex(0)[1],
        getPointAtRelativeIndex(1)[1],
        getPointAtRelativeIndex(2)[1],
        easedSegmentFactor,
      );

      // Organic, tiny physical bobbing effect of the hand holding the glass
      const bobbingScale = 1 + Math.sin(currentTimestamp / 300) * 0.015;

      // 1. Move and scale the physical Magnifying Glass
      if (magnifierRef.current) {
        magnifierRef.current.style.transform = `translate(${currentX}px, ${currentY}px) scale(${bobbingScale})`;
      }

      // 2. Re-position the offset background in the lens to create the zoom illusion
      if (lensRef.current) {
        lensRef.current.style.backgroundSize = `${1024 * zoom}px ${1024 * zoom}px`;
        lensRef.current.style.backgroundPosition = `${-(currentX * zoom - lensRadius)}px ${-(currentY * zoom - lensRadius)}px`;
      }

      // 3. Cycle the loading text dots recursively (e.g., "", ".", "..", "...")
      if (dotsRef.current) {
        dotsRef.current.textContent = ".".repeat(
          Math.floor(currentTimestamp / 450) % 4,
        );
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, zoom, lensRadius, magnifierRef, lensRef, dotsRef]);
}
