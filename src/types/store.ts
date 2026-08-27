import type { Habit, DayKey } from './habit';

export interface HabitStoreState {
  habits: Habit[];
  completions: Record<string, Record<DayKey, boolean>>; // habitId -> dayKey -> done
  theme: 'light' | 'dark';
}