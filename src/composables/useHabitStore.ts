import { computed } from 'vue';
import type { DayKey, Habit, HabitInput } from '@/types/habit';
import type { GlobalStats, HabitStats } from '@/types/stats';
import type { HabitStoreState } from '@/types/store';
import { useLocalStorage } from '@/composables/useLocalStorage';
import { computeStreak } from '@/composables/useStreak';
import { createId } from '@/utils/id';
import { DEFAULT_HABITS_SEED } from '@/constants/habits';

function createStore() {
  const state = useLocalStorage<HabitStoreState>('habit-grid', DEFAULT_HABITS_SEED, {
    version: 1,
  }).value;

  function getHabit(id: string): Habit | undefined {
    return state.value.habits.find((habit) => habit.id === id);
  }

  function isDone(habitId: string, dayKey: DayKey): boolean {
    return state.value.completions[habitId]?.[dayKey] ?? false;
  }

  function habitStats(habitId: string, dayKeys: DayKey[]): HabitStats {
    const doneMap = state.value.completions[habitId] ?? {};
    const totalCompletions = dayKeys.reduce(
      (sum, key) => sum + (doneMap[key] === true ? 1 : 0),
      0,
    );
    const { currentStreak, longestStreak } = computeStreak(dayKeys, doneMap);
    return {
      habitId,
      currentStreak,
      longestStreak,
      totalCompletions,
      completionRate: dayKeys.length > 0 ? totalCompletions / dayKeys.length : 0,
      windowSize: dayKeys.length,
    };
  }

  function globalStats(dayKeys: DayKey[]): GlobalStats {
    const perDayCounts: Record<string, number> = {};
    let totalCompletions = 0;

    for (const habit of state.value.habits) {
      const doneMap = state.value.completions[habit.id] ?? {};
      for (const key of dayKeys) {
        if (doneMap[key] === true) {
          perDayCounts[key] = (perDayCounts[key] ?? 0) + 1;
          totalCompletions++;
        }
      }
    }

    let bestStreak = 0;
    for (const habit of state.value.habits) {
      const { currentStreak } = computeStreak(dayKeys, state.value.completions[habit.id] ?? {});
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    }

    let mostActiveDay: DayKey | null = null;
    if (totalCompletions > 0) {
      let maxCount = 0;
      for (const key of dayKeys) {
        const count = perDayCounts[key] ?? 0;
        if (count >= maxCount) {
          maxCount = count;
          mostActiveDay = key;
        }
      }
    }

    return {
      totalHabits: state.value.habits.length,
      totalCompletions,
      bestStreak,
      mostActiveDay,
      perDayCounts,
    };
  }

  function addHabit(input: HabitInput): Habit {
    const habit: Habit = {
      id: createId(),
      name: input.name.trim(),
      category: input.category,
      emoji: input.emoji,
      createdAt: new Date().toISOString(),
    };
    state.value.habits.push(habit);
    state.value.completions[habit.id] = {};
    return habit;
  }

  function updateHabit(id: string, patch: Partial<HabitInput>): void {
    const habit = getHabit(id);
    if (!habit) return;
    if (patch.name !== undefined) habit.name = patch.name.trim();
    if (patch.category !== undefined) habit.category = patch.category;
    if (patch.emoji !== undefined) habit.emoji = patch.emoji;
  }

  function deleteHabit(id: string): void {
    const index = state.value.habits.findIndex((habit) => habit.id === id);
    if (index >= 0) state.value.habits.splice(index, 1);
    delete state.value.completions[id];
  }

  function toggleDay(habitId: string, dayKey: DayKey): void {
    const map = state.value.completions[habitId];
    if (!map) return;
    map[dayKey] = !(map[dayKey] === true);
  }

  function setDay(habitId: string, dayKey: DayKey, done: boolean): void {
    const map = state.value.completions[habitId];
    if (!map) return;
    map[dayKey] = done;
  }

  function clearAll(): void {
    state.value.habits = [];
    state.value.completions = {};
    state.value.theme = 'dark'; // DEFAULT_HABITS_SEED.theme
  }

  function setTheme(theme: 'light' | 'dark'): void {
    state.value.theme = theme;
  }

  function toggleTheme(): void {
    state.value.theme = state.value.theme === 'dark' ? 'light' : 'dark';
  }

  function importState(newState: HabitStoreState): void {
    state.value = {
      habits: Array.isArray(newState.habits) ? [...newState.habits] : [],
      completions: { ...newState.completions },
      theme: newState.theme === 'light' || newState.theme === 'dark' ? newState.theme : 'dark',
    };
  }

  return {
    habits: computed(() => state.value.habits),
    completions: computed(() => state.value.completions),
    theme: computed(() => state.value.theme),
    state: computed<HabitStoreState>(() => state.value),
    getHabit,
    isDone,
    habitStats,
    globalStats,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleDay,
    setDay,
    clearAll,
    setTheme,
    toggleTheme,
    importState,
  };
}

let instance: ReturnType<typeof createStore> | null = null;

/** Module singleton — every call returns the same shared instance. */
export function useHabitStore(): ReturnType<typeof createStore> {
  if (instance === null) instance = createStore();
  return instance;
}