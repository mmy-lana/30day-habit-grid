<script setup lang="ts">
import { computed } from 'vue';
import type { Habit } from '@/types/habit';
import type { HabitStats } from '@/types/stats';
import { CATEGORY_COLORS } from '@/constants/palette';
import { CATEGORIES } from '@/constants/habits';
import Heading from '@/components/atoms/Heading.vue';
import ColorDot from '@/components/atoms/ColorDot.vue';
import BaseBadge from '@/components/atoms/BaseBadge.vue';
import StatTile from '@/components/atoms/StatTile.vue';
import IconButton from '@/components/atoms/IconButton.vue';

const props = withDefaults(
  defineProps<{ habit: Habit; stats: HabitStats; isDoneToday: boolean }>(),
  {},
);

const emit = defineEmits<{ edit: []; delete: []; toggleToday: [] }>();

const categoryLabel = computed(
  () => CATEGORIES.find((category) => category.value === props.habit.category)?.label
    ?? props.habit.category,
);

const completionRate = computed(() => `${Math.round(props.stats.completionRate * 100)}%`);

const checkinLabel = computed(() =>
  props.isDoneToday ? '✓ Done today' : '+ Check in today',
);

const checkinAriaLabel = computed(() =>
  props.isDoneToday ? 'Mark today as not done' : 'Mark today as done',
);

const checkinClasses = computed(() =>
  props.isDoneToday
    ? 'inline-flex items-center gap-1 rounded-full bg-level-4/15 text-level-4 border border-level-4/30 hover:bg-level-4/25 px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-level-4'
    : 'inline-flex items-center gap-1 rounded-full border border-gh-border bg-transparent px-3 py-1 text-xs font-medium text-gh-text transition-colors hover:bg-gh-border/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-level-4',
);
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
    <div class="flex min-w-0 items-center gap-2">
      <span
        v-if="habit.emoji"
        class="shrink-0 text-xl"
        aria-hidden="true"
      >{{ habit.emoji }}</span>
      <Heading
        :level="3"
        :text="habit.name"
        class="min-w-0 truncate"
        :title="habit.name"
      />
      <ColorDot
        :color="CATEGORY_COLORS[habit.category]"
        class="shrink-0"
      />
      <BaseBadge
        :text="categoryLabel"
        class="shrink-0"
      />
      <button
        type="button"
        :aria-pressed="isDoneToday"
        :aria-label="checkinAriaLabel"
        :class="checkinClasses"
        @click="emit('toggleToday')"
      >
        {{ checkinLabel }}
      </button>
    </div>
    <div class="ml-auto flex items-center gap-3 sm:gap-4">
      <StatTile
        label="Streak"
        :value="stats.currentStreak"
      />
      <StatTile
        label="Total"
        :value="stats.totalCompletions"
      />
      <StatTile
        label="Rate"
        :value="completionRate"
      />
      <div class="flex items-center gap-0.5">
        <IconButton
          label="Edit habit"
          @click="emit('edit')"
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L4.022 10.53l2.276 2.276 8.043-8.043a.25.25 0 0 0 0-.354l-1.086-1.086a.25.25 0 0 0-.354 0Z"
            />
          </svg>
        </IconButton>
        <IconButton
          label="Delete habit"
          @click="emit('delete')"
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a1.75 1.75 0 0 0 1.745 1.632h2.198a1.75 1.75 0 0 0 1.745-1.632l.66-6.6H4.496Z"
            />
          </svg>
        </IconButton>
      </div>
    </div>
  </div>
</template>