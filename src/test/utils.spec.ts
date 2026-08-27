import { describe, expect, it } from 'vitest';
import {
  formatFullDate,
  lastNDays,
  monthShort,
  parseDateKey,
  toDateKey,
  todayKey,
  weekdayShort,
} from '@/utils/date';
import { createId } from '@/utils/id';
import { sanitizeText } from '@/utils/text';
import { combinedIntensity, singleHabitIntensity } from '@/utils/intensity';
import { computeStreak } from '@/composables/useStreak';
import type { DayKey } from '@/types/habit';

describe('date utils', () => {
  it('toDateKey formats local dates as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 7, 27))).toBe('2026-08-27');
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('parseDateKey round-trips toDateKey', () => {
    const key = '2026-08-27';
    const date = parseDateKey(key);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(27);
    expect(toDateKey(date)).toBe(key);
  });

  it('todayKey returns the reference local day', () => {
    expect(todayKey(new Date(2026, 7, 27))).toBe('2026-08-27');
  });

  it('lastNDays returns a rolling window ending on refDate, oldest first', () => {
    const ref = new Date(2026, 7, 27);
    const keys = lastNDays(30, ref);
    expect(keys).toHaveLength(30);
    expect(keys[0]).toBe('2026-07-29');
    expect(keys[29]).toBe('2026-08-27');
    expect(keys).toEqual([...keys].sort());
  });

  it('lastNDays honors the window size', () => {
    const ref = new Date(2026, 7, 27);
    const keys = lastNDays(3, ref);
    expect(keys).toEqual(['2026-08-25', '2026-08-26', '2026-08-27']);
  });

  it('weekdayShort and monthShort format labels', () => {
    expect(weekdayShort('2026-08-27')).toBe('Thu');
    expect(monthShort('2026-08-27')).toBe('Aug');
  });

  it('formatFullDate composes a readable date', () => {
    expect(formatFullDate('2026-08-27')).toBe('Thu, Aug 27 2026');
  });
});

describe('id utils', () => {
  it('createId returns unique non-empty identifiers', () => {
    const first = createId();
    const second = createId();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(0);
  });
});

describe('text utils', () => {
  it('sanitizeText trims whitespace', () => {
    expect(sanitizeText('  hi  ', 10)).toBe('hi');
  });

  it('sanitizeText strips control chars', () => {
    expect(sanitizeText('a\x00b\x1Fc\x7Fd', 10)).toBe('abcd');
  });

  it('sanitizeText hard-caps length', () => {
    expect(sanitizeText('abcdefghij', 5)).toBe('abcde');
  });

  it('sanitizeText applies strip -> trim -> slice in order', () => {
    expect(sanitizeText(' \x00 hi \x00 ', 10)).toBe('hi');
  });

  it('sanitizeText leaves normal text intact', () => {
    expect(sanitizeText('Morning run', 40)).toBe('Morning run');
  });
});

describe('intensity utils', () => {
  it('singleHabitIntensity is binary', () => {
    expect(singleHabitIntensity(false)).toBe(0);
    expect(singleHabitIntensity(true)).toBe(4);
  });

  it('combinedIntensity buckets by ratio', () => {
    expect(combinedIntensity(0, 5)).toBe(0);
    expect(combinedIntensity(0, 0)).toBe(0);
    expect(combinedIntensity(1, 4)).toBe(1);
    expect(combinedIntensity(2, 4)).toBe(2);
    expect(combinedIntensity(3, 4)).toBe(3);
    expect(combinedIntensity(4, 4)).toBe(4);
    expect(combinedIntensity(4, 1)).toBe(4);
    expect(combinedIntensity(1, 1)).toBe(4);
  });
});

describe('computeStreak', () => {
  const windowKeys = (count: number): DayKey[] => lastNDays(count, new Date(2026, 7, 27));

  it('returns zero streaks for an empty window', () => {
    expect(computeStreak([], {})).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it('counts an all-done window as one long run', () => {
    const days = windowKeys(5);
    const doneMap = Object.fromEntries(days.map((key) => [key, true]));
    expect(computeStreak(days, doneMap)).toEqual({ currentStreak: 5, longestStreak: 5 });
  });

  it('continues yesterday\'s streak when today is missed (morning-zero fix)', () => {
    const days = windowKeys(5);
    const doneMap = Object.fromEntries(days.slice(0, 4).map((key) => [key, true]));
    expect(computeStreak(days, doneMap)).toEqual({ currentStreak: 4, longestStreak: 4 });
  });

  it('finds the longest mid-window run independently of today', () => {
    const days = windowKeys(6);
    const pattern = [false, true, true, true, false, true];
    const doneMap: Record<DayKey, boolean> = {};
    days.forEach((key, index) => {
      const value = pattern[index];
      if (value !== undefined) doneMap[key] = value;
    });
    expect(computeStreak(days, doneMap)).toEqual({ currentStreak: 1, longestStreak: 3 });
  });

  it('handles sparse done maps', () => {
    const days = windowKeys(4);
    const doneMap: Record<DayKey, boolean> = {};
    const middle = days[2];
    if (middle != null) doneMap[middle] = true;
    expect(computeStreak(days, doneMap)).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  it('returns zero when both today and yesterday are missed', () => {
    const days = windowKeys(5);
    const doneMap: Record<DayKey, boolean> = {};
    days.slice(0, 3).forEach((key) => {
      doneMap[key] = true;
    });
    expect(computeStreak(days, doneMap)).toEqual({ currentStreak: 0, longestStreak: 3 });
  });
});