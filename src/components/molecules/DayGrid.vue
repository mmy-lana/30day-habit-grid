<script setup lang="ts">
import { computed } from 'vue';
import type { DayKey, IntensityLevel } from '@/types/habit';
import { GRID_COLS_RESPONSIVE } from '@/constants/grid';
import { formatMonthDay } from '@/utils/date';
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

const today = computed<DayKey>(() => props.days[props.days.length - 1] ?? '');

const startLabel = computed(() =>
  props.days.length > 0
    ? `${formatMonthDay(props.days[0] ?? '')} (${props.days.length}d ago)`
    : '',
);

const endLabel = computed(() =>
  props.days.length > 0
    ? `Today (${formatMonthDay(props.days[props.days.length - 1] ?? '')})`
    : '',
);

function onToggle(day: DayKey): void {
  if (props.readonly) return;
  emit('toggle', day);
}
</script>

<template>
  <div>
    <div
      v-if="days.length > 0"
      class="mb-2 flex items-center gap-2 text-xs text-gh-muted min-w-0"
    >
      <span class="whitespace-nowrap shrink-0">{{ startLabel }}</span>
      <span
        class="flex-1 border-t border-gh-border/60"
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 8 8"
        class="h-2 w-2 shrink-0 text-gh-muted"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M1 0.5 7 4 1 7.5z" />
      </svg>
      <span class="whitespace-nowrap shrink-0">{{ endLabel }}</span>
    </div>
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
        :is-today="day === today"
        :disabled="readonly"
        @toggle="onToggle"
      />
    </div>
  </div>
</template>

<style scoped>
.habit-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 6), minmax(0, 1fr));
  gap: 2px;
  align-items: start;
}
@media (min-width: 640px) {
  .habit-grid {
    --cols: var(--cols-sm, 10);
    gap: 3px;
  }
}
@media (min-width: 1024px) {
  .habit-grid {
    --cols: var(--cols-lg, 15);
  }
}
</style>