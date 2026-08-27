import type { DayKey } from '@/types/habit';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Format a Date as a local `YYYY-MM-DD` day key. */
export function toDateKey(date: Date): DayKey {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Parse a `YYYY-MM-DD` day key into a local Date at midnight. */
export function parseDateKey(key: DayKey): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

/** Day key of the given reference date (defaults to now). */
export function todayKey(refDate: Date = new Date()): DayKey {
  return toDateKey(refDate);
}

/** Rolling window of the last `days` day keys (oldest → newest) ending on `refDate` inclusive. */
export function lastNDays(days: number, refDate: Date = new Date()): DayKey[] {
  const result: DayKey[] = [];
  const cursor = new Date(refDate);
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - offset);
    result.push(toDateKey(date));
  }
  return result;
}

/** e.g. `Mon` */
export function weekdayShort(key: DayKey): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(parseDateKey(key));
}

/** e.g. `Aug` */
export function monthShort(key: DayKey): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(parseDateKey(key));
}

/** e.g. `Mon, Aug 27 2026` */
export function formatFullDate(key: DayKey): string {
  const date = parseDateKey(key);
  return `${weekdayShort(key)}, ${monthShort(key)} ${date.getDate()} ${date.getFullYear()}`;
}

/** e.g. `Aug 27` — short month + day-of-month, no year (for compact timeline labels). */
export function formatMonthDay(key: DayKey): string {
  return `${monthShort(key)} ${parseDateKey(key).getDate()}`;
}