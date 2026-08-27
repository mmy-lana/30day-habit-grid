import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import type { HabitStats } from '@/types/stats';
import { useHabitStore } from '@/composables/useHabitStore';
import { useDateGrid } from '@/composables/useDateGrid';

/** Reactive per-habit stats for the rolling 30-day window. */
export function useHabitStats(habitId: string): ComputedRef<HabitStats> {
  const store = useHabitStore();
  const { dayKeys } = useDateGrid();
  return computed(() => store.habitStats(habitId, dayKeys.value));
}