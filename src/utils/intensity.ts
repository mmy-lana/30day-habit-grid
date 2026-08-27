import type { IntensityLevel } from '@/types/habit';

/**
 * Bucket a `done/total` ratio into a GitHub-style 0–4 intensity level.
 * 0 when nothing is done or there is nothing to compare against.
 */
export function combinedIntensity(done: number, total: number): IntensityLevel {
  if (total <= 0 || done <= 0) return 0;
  const ratio = done / total;
  if (ratio >= 1) return 4;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

/** Per-habit grids are binary: not done → 0, done → 4. */
export const singleHabitIntensity = (done: boolean): IntensityLevel => (done ? 4 : 0);