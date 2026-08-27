import type { DayKey } from '@/types/habit';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Streak math over an ordered window of day keys (oldest → newest).
 * - `currentStreak`: consecutive done days ending at the last key. "Morning zero" rule:
 *   if today is not done but yesterday was, the run ending yesterday continues.
 * - `longestStreak`: the longest consecutive done run anywhere in the window.
 */
export function computeStreak(dayKeys: DayKey[], doneMap: Record<DayKey, boolean>): StreakResult {
  const lastIndex = dayKeys.length - 1;
  const todayKey = dayKeys[lastIndex];
  const todayDone = todayKey != null && doneMap[todayKey] === true;

  let startIndex = lastIndex;
  if (!todayDone && lastIndex >= 1) startIndex = lastIndex - 1; // fall back to yesterday

  let currentStreak = 0;
  for (let index = startIndex; index >= 0; index--) {
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