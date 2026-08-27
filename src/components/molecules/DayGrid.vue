<script setup lang="ts">
import { computed } from 'vue';
import type { DayKey, IntensityLevel } from '@/types/habit';
import { GRID_COLS_RESPONSIVE } from '@/constants/grid';
import DayCell from '@/components/atoms/DayCell.vue';

const props = withDefaults(
  defineProps<{
    days: DayKey[];
    intensityFor: (day: DayKey) => IntensityLevel;
    labelFor?: (day: DayKey) => string;
    readonly?: boolean;
    ariaLabel?: string;
    cols?: { base: number; sm: number; lg: number };
  }>(),
  {
    labelFor: undefined,
    readonly: false,
    ariaLabel: undefined,
    cols: () => ({ ...GRID_COLS_RESPONSIVE }),
  },
);

const emit = defineEmits<{ toggle: [day: DayKey] }>();

const gridStyle = computed(() => ({
  '--cols': String(props.cols.base),
  '--cols-sm': String(props.cols.sm),
  '--cols-lg': String(props.cols.lg),
}));

function onToggle(day: DayKey): void {
  if (props.readonly) return;
  emit('toggle', day);
}
</script>

<template>
  <div
    role="grid"
    :aria-label="ariaLabel ?? 'Last 30 days'"
    :class="readonly ? 'habit-grid pointer-events-none' : 'habit-grid'"
    :style="gridStyle"
  >
    <DayCell
      v-for="day in days"
      :key="day"
      :intensity="intensityFor(day)"
      :date="day"
      :label="labelFor?.(day)"
      :disabled="readonly"
      @toggle="onToggle"
    />
  </div>
</template>

<style scoped>
.habit-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 6), minmax(0, 1fr));
  gap: 3px;
  align-items: start;
}
@media (min-width: 640px) {
  .habit-grid {
    --cols: var(--cols-sm, 10);
  }
}
@media (min-width: 1024px) {
  .habit-grid {
    --cols: var(--cols-lg, 15);
  }
}
</style>