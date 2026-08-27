<script setup lang="ts">
import { computed } from 'vue';
import type { DayKey, Habit } from '@/types/habit';
import type { HabitStats } from '@/types/stats';
import { useIntensity } from '@/composables/useIntensity';
import StatsHeader from '@/components/molecules/StatsHeader.vue';
import DayGrid from '@/components/molecules/DayGrid.vue';

const props = withDefaults(
  defineProps<{ habit: Habit; days: DayKey[]; stats: HabitStats }>(),
  {},
);

const emit = defineEmits<{
  toggle: [habitId: string, day: DayKey];
  edit: [habitId: string];
  delete: [habitId: string];
}>();

const { single } = useIntensity();

const intensityFor = (day: DayKey) => single(props.habit.id, day);

const today = computed<DayKey>(() => props.days[props.days.length - 1] ?? '');

const isDoneToday = computed(() => intensityFor(today.value) > 0);
</script>

<template>
  <section class="rounded-lg border border-gh-border bg-gh-panel p-4">
    <StatsHeader
      :habit="habit"
      :stats="stats"
      :is-done-today="isDoneToday"
      @edit="emit('edit', habit.id)"
      @delete="emit('delete', habit.id)"
      @toggle-today="emit('toggle', habit.id, today)"
    />
    <div class="mt-3 overflow-x-auto">
      <DayGrid
        :days="days"
        :intensity-for="intensityFor"
        :aria-label="`${habit.name} — last 30 days`"
        @toggle="(day) => emit('toggle', habit.id, day)"
      />
    </div>
  </section>
</template>