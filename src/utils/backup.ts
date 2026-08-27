import type { HabitStoreState } from '@/types/store';
import type { Habit, HabitCategory } from '@/types/habit';
import { CATEGORIES } from '@/constants/habits';
import { todayKey } from '@/utils/date';

const VALID_CATEGORIES = new Set<HabitCategory>(CATEGORIES.map((category) => category.value));
const VALID_THEMES = new Set<'light' | 'dark'>(['light', 'dark']);

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Download the full store as a formatted JSON file named `habit-grid-backup-YYYY-MM-DD.json`
 * (today's local date). SSR-safe no-op when `document` is unavailable.
 */
export function exportBackup(state: HabitStoreState): void {
  if (typeof document === 'undefined') return;
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `habit-grid-backup-${todayKey()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function isValidHabit(habit: unknown): habit is Habit {
  if (!isRecord(habit)) return false;
  if (!isString(habit.id) || habit.id.length === 0) return false;
  if (!isString(habit.name) || habit.name.length === 0 || habit.name.length > 40) return false;
  if (!isString(habit.category) || !VALID_CATEGORIES.has(habit.category as HabitCategory)) return false;
  if (!isString(habit.createdAt) || habit.createdAt.length === 0) return false;
  if (habit.emoji !== undefined && !isString(habit.emoji)) return false;
  return true;
}

/**
 * Type guard for the persisted store shape. Zero `any` — validates against
 * `unknown` and narrows to `HabitStoreState` on success.
 */
export function validateBackupSchema(data: unknown): data is HabitStoreState {
  if (!isRecord(data)) return false;
  if (!Array.isArray(data.habits)) return false;
  if (!data.habits.every(isValidHabit)) return false;

  if (!isRecord(data.completions)) return false;
  for (const dayMap of Object.values(data.completions)) {
    if (!isRecord(dayMap)) return false;
    for (const done of Object.values(dayMap)) {
      if (typeof done !== 'boolean') return false;
    }
  }

  if (!isString(data.theme) || !VALID_THEMES.has(data.theme as 'light' | 'dark')) return false;
  return true;
}

/**
 * Read a backup `File` and parse it into a validated `HabitStoreState`.
 * Throws human-readable errors on malformed JSON or schema mismatches.
 */
export async function readBackupFile(file: File): Promise<HabitStoreState> {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(buffer);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }
  if (!validateBackupSchema(parsed)) {
    throw new Error('Backup file does not match the expected habit-grid schema.');
  }
  return parsed;
}