import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { DayKey } from '@/types/habit';
import { formatFullDate, lastNDays, monthShort, parseDateKey, todayKey, weekdayShort } from '@/utils/date';

/**
 * The rolling 30-day window ending today (inclusive). All cells are toggleable —
 * none are "future". On tab focus the window re-evaluates `new Date()` so the grid
 * rolls over at midnight without a long-running interval.
 */
export function useDateGrid(days = 30, refDate: Date = new Date()) {
  const refDateRef: Ref<Date> = ref(refDate);

  const todayKeyRef: ComputedRef<string> = computed(() => todayKey(refDateRef.value));
  const dayKeys: ComputedRef<DayKey[]> = computed(() => lastNDays(days, refDateRef.value));

  const dayNumber = (key: DayKey): number => parseDateKey(key).getDate();

  const handleVisibility = (): void => {
    if (document.visibilityState === 'visible') {
      refDateRef.value = new Date();
    }
  };

  onMounted(() => {
    refDateRef.value = new Date();
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibility);
  });

  return {
    todayKey: todayKeyRef,
    dayKeys,
    formatFullDate,
    weekdayShort,
    monthShort,
    dayNumber,
  };
}