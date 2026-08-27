import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DayKey } from '@/types/habit';
import { lastNDays } from '@/utils/date';

const days: DayKey[] = lastNDays(30, new Date(2026, 7, 27));
const today = days[days.length - 1];
const yesterday = days[days.length - 2];

const flushWrites = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 130));

describe('useHabitStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  async function loadStore() {
    const { useHabitStore } = await import('@/composables/useHabitStore');
    return useHabitStore();
  }

  it('adds a habit and reflects it in stats', async () => {
    const store = await loadStore();
    const habit = store.addHabit({ name: 'Morning run', category: 'fitness', emoji: '🏃' });
    expect(store.habits.value).toHaveLength(1);
    expect(store.habits.value[0]?.name).toBe('Morning run');
    expect(store.habits.value[0]?.category).toBe('fitness');
    expect(store.habits.value[0]?.emoji).toBe('🏃');
    const stats = store.habitStats(habit.id, days);
    expect(stats.totalCompletions).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.windowSize).toBe(30);
  });

  it('toggleDay flips done state and updates stats', async () => {
    const store = await loadStore();
    const habit = store.addHabit({ name: 'Read', category: 'learning' });
    if (today == null) throw new Error('test window missing today');
    store.toggleDay(habit.id, today);
    expect(store.isDone(habit.id, today)).toBe(true);
    expect(store.habitStats(habit.id, days).currentStreak).toBe(1);
    expect(store.habitStats(habit.id, days).totalCompletions).toBe(1);

    store.toggleDay(habit.id, today);
    expect(store.isDone(habit.id, today)).toBe(false);
    expect(store.habitStats(habit.id, days).currentStreak).toBe(0);
  });

  it('setDay writes explicit values', async () => {
    const store = await loadStore();
    const habit = store.addHabit({ name: 'Write', category: 'creativity' });
    if (today == null || yesterday == null) throw new Error('test window missing days');
    store.setDay(habit.id, today, true);
    store.setDay(habit.id, yesterday, true);
    store.setDay(habit.id, today, false);
    expect(store.isDone(habit.id, today)).toBe(false);
    expect(store.isDone(habit.id, yesterday)).toBe(true);
    expect(store.habitStats(habit.id, days).currentStreak).toBe(0);
  });

  it('globalStats aggregates across habits', async () => {
    const store = await loadStore();
    const first = store.addHabit({ name: 'A', category: 'health' });
    const second = store.addHabit({ name: 'B', category: 'fitness' });
    if (today == null || yesterday == null) throw new Error('test window missing days');
    store.setDay(first.id, today, true);
    store.setDay(first.id, yesterday, true);
    store.setDay(second.id, today, true);

    const gs = store.globalStats(days);
    expect(gs.totalHabits).toBe(2);
    expect(gs.totalCompletions).toBe(3);
    expect(gs.perDayCounts[today]).toBe(2);
    expect(gs.perDayCounts[yesterday]).toBe(1);
    expect(gs.bestStreak).toBe(2);
    expect(gs.mostActiveDay).toBe(today);
  });

  it('delete removes the habit and its completions', async () => {
    const store = await loadStore();
    const first = store.addHabit({ name: 'A', category: 'health' });
    const second = store.addHabit({ name: 'B', category: 'social' });
    if (today == null) throw new Error('test window missing today');
    store.toggleDay(first.id, today);
    store.toggleDay(second.id, today);

    store.deleteHabit(first.id);
    expect(store.habits.value.map((habit) => habit.id)).toEqual([second.id]);
    expect(store.completions.value[first.id]).toBeUndefined();
    expect(store.completions.value[second.id]).toBeDefined();
  });

  it('updateHabit patches fields', async () => {
    const store = await loadStore();
    const habit = store.addHabit({ name: '  Gym  ', category: 'fitness', emoji: '💪' });
    store.updateHabit(habit.id, { name: 'Yoga', category: 'mindfulness' });
    expect(store.habits.value[0]?.name).toBe('Yoga');
    expect(store.habits.value[0]?.category).toBe('mindfulness');
    expect(store.habits.value[0]?.emoji).toBe('💪');
  });

  it('theme toggles and persists across a simulated reload', async () => {
    const store = await loadStore();
    expect(store.theme.value).toBe('dark');
    store.toggleTheme();
    expect(store.theme.value).toBe('light');

    await flushWrites();
    vi.resetModules();
    const { useHabitStore: reloaded } = await import('@/composables/useHabitStore');
    const store2 = reloaded();
    expect(store2.theme.value).toBe('light');
  });

  it('habits and completions persist across a simulated reload', async () => {
    const store = await loadStore();
    const habit = store.addHabit({ name: 'Meditate', category: 'mindfulness' });
    if (today == null) throw new Error('test window missing today');
    store.toggleDay(habit.id, today);

    await flushWrites();
    vi.resetModules();
    const { useHabitStore: reloaded } = await import('@/composables/useHabitStore');
    const store2 = reloaded();
    expect(store2.habits.value).toHaveLength(1);
    expect(store2.habits.value[0]?.name).toBe('Meditate');
    expect(store2.isDone(habit.id, today)).toBe(true);
  });

  it('clearAll resets habits, completions, and theme to seed', async () => {
    const store = await loadStore();
    store.addHabit({ name: 'X', category: 'health' });
    store.setTheme('light');
    store.clearAll();
    expect(store.habits.value).toHaveLength(0);
    expect(store.completions.value).toEqual({});
    expect(store.theme.value).toBe('dark');
  });
});