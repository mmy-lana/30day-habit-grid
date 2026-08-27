<script setup lang="ts">
import { computed } from 'vue';
import type { IntensityLevel, DayKey } from '@/types/habit';
import { formatFullDate } from '@/utils/date';

const props = withDefaults(
  defineProps<{
    intensity: IntensityLevel;
    date: DayKey;
    label?: string;
    disabled?: boolean;
    isToday?: boolean;
  }>(),
  { label: undefined, disabled: false, isToday: false },
);

const emit = defineEmits<{ toggle: [date: DayKey] }>();

const cellStyle = computed(() => ({
  backgroundColor: `var(--gh-level-${props.intensity})`,
}));

const cellClasses = computed(() => [
  props.intensity === 0 ? 'border border-gh-border/20' : '',
  props.isToday ? 'ring-2 ring-level-4 ring-offset-1 ring-offset-gh-panel' : '',
]);

const baseLabel = computed(() => {
  if (props.label != null) return props.label; // explicit caller override
  const status = props.intensity > 0 ? 'Completed' : 'Not completed';
  return `${formatFullDate(props.date)} · ${status}`;
});

const resolvedLabel = computed(() =>
  props.isToday ? `Today — ${baseLabel.value}` : baseLabel.value,
);

function onToggle(): void {
  if (props.disabled) return;
  emit('toggle', props.date);
}

function onKeydown(evt: KeyboardEvent): void {
  if (props.disabled) return;
  if (evt.key === 'Enter' || evt.key === ' ') {
    evt.preventDefault();
    emit('toggle', props.date);
  }
}
</script>

<template>
  <button
    type="button"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :title="resolvedLabel"
    :aria-label="resolvedLabel"
    :aria-pressed="intensity > 0"
    :disabled="disabled"
    class="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-[4px] cursor-pointer touch-manipulation transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-level-4"
    :class="cellClasses"
    :style="cellStyle"
    @click="onToggle"
    @keydown="onKeydown"
  />
</template>