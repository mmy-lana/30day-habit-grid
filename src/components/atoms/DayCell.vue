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
    size?: 'sm' | 'md';
  }>(),
  { label: undefined, disabled: false, size: 'md' },
);

const emit = defineEmits<{ toggle: [date: DayKey] }>();

const cellStyle = computed(() => ({
  backgroundColor: `var(--gh-level-${props.intensity})`,
}));

const cellSizeClasses = computed(() =>
  props.size === 'sm'
    ? 'h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5'
    : 'h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4',
);

const cellClasses = computed(() => [
  cellSizeClasses.value,
  props.intensity === 0 ? 'border border-gh-border/20' : '',
]);

const resolvedLabel = computed(() => {
  if (props.label != null) return props.label; // explicit caller override
  const status = props.intensity > 0 ? 'Completed' : 'Not completed';
  return `${formatFullDate(props.date)} · ${status}`;
});

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
    class="-m-1.5 rounded p-1.5 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-level-4"
    @click="onToggle"
    @keydown="onKeydown"
  >
    <span
      aria-hidden="true"
      class="block rounded-[2px] transition-transform hover:scale-110"
      :class="cellClasses"
      :style="cellStyle"
    />
  </button>
</template>