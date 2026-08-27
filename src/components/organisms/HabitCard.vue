<script setup lang="ts">
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
</script>

<template>
  <section class="rounded-lg border border-gh-border bg-gh-panel p-4">
    <StatsHeader
      :habit="habit"
      :stats="stats"
      @edit="emit('edit', habit.id)"
      @delete="emit('delete', habit.id)"
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