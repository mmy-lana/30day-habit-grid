import type { DayKey } from '@/types/habit';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Streak math over an ordered window of day keys (oldest → newest).
 * - `currentStreak`: consecutive done days ending at the last key (0 if today is missed).
 * - `longestStreak`: the longest consecutive done run anywhere in the window.
 */
export function computeStreak(dayKeys: DayKey[], doneMap: Record<DayKey, boolean>): StreakResult {
  let currentStreak = 0;
  for (let index = dayKeys.length - 1; index >= 0; index--) {
    const key = dayKeys[index];
    if (key != null && doneMap[key] === true) {
      currentStreak++;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let run = 0;
  for (const key of dayKeys) {
    if (doneMap[key] === true) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 0;
    }
  }

  return { currentStreak, longestStreak };
}