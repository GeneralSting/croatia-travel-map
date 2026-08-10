import { POI } from "../types/types";

// true for a user-created custom POI (opposed to a shared default)
export function isCustomPoi(poi: POI): boolean {
  return poi.owner_id != null;
}

// calculates the Catmull-Rom spline interpolation point
export const interpolateCatmullRom = (
  previousPoint: number,
  startPoint: number,
  endPoint: number,
  nextPoint: number,
  progress: number,
): number => {
  const progressSquared = progress * progress;
  const progressCubed = progressSquared * progress;

  return (
    0.5 *
    (2 * startPoint +
      (-previousPoint + endPoint) * progress +
      (2 * previousPoint - 5 * startPoint + 4 * endPoint - nextPoint) *
        progressSquared +
      (-previousPoint + 3 * startPoint - 3 * endPoint + nextPoint) *
        progressCubed)
  );
};

export const newId = (): string => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};
