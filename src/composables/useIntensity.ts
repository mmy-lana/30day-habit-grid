import type { DayKey, IntensityLevel } from '@/types/habit';
import { useHabitStore } from '@/composables/useHabitStore';
import { combinedIntensity, singleHabitIntensity } from '@/utils/intensity';

/** Intensity lookups bound to the singleton store. */
export function useIntensity() {
  const store = useHabitStore();

  function single(habitId: string, dayKey: DayKey): IntensityLevel {
    return singleHabitIntensity(store.isDone(habitId, dayKey));
  }

  function combined(dayKey: DayKey, totalHabits?: number): IntensityLevel {
    const total = totalHabits ?? store.habits.value.length;
    let done = 0;
    for (const habit of store.habits.value) {
      if (store.isDone(habit.id, dayKey)) done++;
    }
    return combinedIntensity(done, total);
  }

  return { single, combined };
}