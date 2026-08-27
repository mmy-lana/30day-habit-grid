export type IntensityLevel = 0 | 1 | 2 | 3 | 4; // 0 = none, 4 = most
export type DayKey = string; // canonical 'YYYY-MM-DD' (local)
export type HabitCategory =
  | 'health'
  | 'learning'
  | 'fitness'
  | 'mindfulness'
  | 'creativity'
  | 'social';

export interface Habit {
  id: string; // crypto.randomUUID()
  name: string; // 1..40 chars (validated)
  category: HabitCategory;
  emoji?: string; // optional, single grapheme
  createdAt: string; // ISO 8601 datetime
}

export interface HabitInput {
  // payload for add/edit (no id/timestamps)
  name: string;
  category: HabitCategory;
  emoji?: string;
}