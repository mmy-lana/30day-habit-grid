import type { DayKey } from './habit';

export interface HabitStats {
  habitId: string;
  currentStreak: number; // consecutive done days ending today (0 if today not done)
  longestStreak: number; // longest run within the 30-day window
  totalCompletions: number; // count of done days in window
  completionRate: number; // totalCompletions / GRID_DAYS, 0..1
  windowSize: number; // == GRID_DAYS (30)
}

export interface GlobalStats {
  totalHabits: number;
  totalCompletions: number; // sum across habits in window
  bestStreak: number; // max currentStreak across habits
  mostActiveDay: DayKey | null; // day with most completions (ties → newest)
  perDayCounts: Record<DayKey, number>; // done-count per day across all habits
}