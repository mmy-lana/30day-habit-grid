<script setup lang="ts">
import type { DayKey } from '@/types/habit';
import type { GlobalStats } from '@/types/stats';
import { combinedIntensity } from '@/utils/intensity';
import { formatFullDate } from '@/utils/date';
import DayGrid from '@/components/molecules/DayGrid.vue';
import LegendBar from '@/components/molecules/LegendBar.vue';
import Heading from '@/components/atoms/Heading.vue';

const props = withDefaults(
  defineProps<{
    days: DayKey[];
    globalStats: GlobalStats;
    totalHabits: number;
    readonly?: boolean;
  }>(),
  { readonly: true },
);

const emit = defineEmits<{ toggle: [day: DayKey] }>();

const intensityFor = (day: DayKey) =>
  combinedIntensity(props.globalStats.perDayCounts[day] ?? 0, props.totalHabits);

const labelFor = (day: DayKey) =>
  `${props.globalStats.perDayCounts[day] ?? 0}/${props.totalHabits} habits — ${formatFullDate(day)}`;
</script>

<template>
  <section
    v-if="totalHabits > 0"
    class="rounded-lg border border-gh-border bg-gh-panel p-4"
  >
    <Heading
      :level="2"
      text="All habits — last 30 days"
    />
    <div class="mt-3 overflow-x-auto">
      <DayGrid
        :days="days"
        :intensity-for="intensityFor"
        :label-for="labelFor"
        :readonly="readonly"
        aria-label="Combined intensity across all habits — last 30 days"
        @toggle="emit('toggle', $event)"
      />
    </div>
    <div class="mt-3">
      <LegendBar :max="totalHabits" />
    </div>
  </section>
</template>