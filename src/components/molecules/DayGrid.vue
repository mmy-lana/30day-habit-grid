<script setup lang="ts">
import { computed } from 'vue';
import type { DayKey, IntensityLevel } from '@/types/habit';
import { formatMonthDay } from '@/utils/date';
import DayCell from '@/components/atoms/DayCell.vue';

const props = withDefaults(
  defineProps<{
    days: DayKey[];
    intensityFor: (day: DayKey) => IntensityLevel;
    labelFor?: (day: DayKey) => string;
    readonly?: boolean;
    ariaLabel?: string;
  }>(),
  {
    labelFor: undefined,
    readonly: false,
    ariaLabel: undefined,
  },
);

const emit = defineEmits<{ toggle: [day: DayKey] }>();

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
  <div class="w-fit">
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
      class="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-15 gap-1.5 sm:gap-2 w-fit"
      :class="readonly ? 'pointer-events-none' : ''"
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