<script setup lang="ts">
import { computed } from 'vue';
import type { HabitCategory } from '@/types/habit';
import { CATEGORIES } from '@/constants/habits';
import { CATEGORY_COLORS } from '@/constants/palette';
import ColorDot from '@/components/atoms/ColorDot.vue';

type CategoryFilter = 'all' | HabitCategory;

const props = withDefaults(
  defineProps<{ modelValue: CategoryFilter }>(),
  { modelValue: 'all' },
);

const emit = defineEmits<{ 'update:modelValue': [value: CategoryFilter] }>();

interface FilterOption {
  value: CategoryFilter;
  label: string;
  color?: string;
}

const options = computed<FilterOption[]>(() => [
  { value: 'all', label: 'All' },
  ...CATEGORIES.map((category) => ({
    value: category.value as CategoryFilter,
    label: category.label,
    color: CATEGORY_COLORS[category.value],
  })),
]);

const activeClasses = 'inline-flex items-center gap-1.5 rounded-full bg-gh-border/60 px-3 py-1 text-xs font-medium text-gh-text';
const inactiveClasses = 'inline-flex items-center gap-1.5 rounded-full border border-gh-border bg-transparent px-3 py-1 text-xs font-medium text-gh-muted transition-colors hover:bg-gh-border/30 hover:text-gh-text';

function select(value: CategoryFilter): void {
  if (value !== props.modelValue) emit('update:modelValue', value);
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-2"
    role="group"
    aria-label="Filter habits by category"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="option.value === modelValue"
      :class="option.value === modelValue ? activeClasses : inactiveClasses"
      @click="select(option.value)"
    >
      <ColorDot
        v-if="option.color"
        :color="option.color"
        size="xs"
      />
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>