<script setup lang="ts">
import type { DayKey, Habit, HabitCategory } from '@/types/habit';
import type { HabitStats } from '@/types/stats';
import { useHabitStore } from '@/composables/useHabitStore';
import HabitCard from '@/components/organisms/HabitCard.vue';
import EmptyState from '@/components/atoms/EmptyState.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

const props = withDefaults(
  defineProps<{ habits: Habit[]; days: DayKey[]; categoryFilter?: 'all' | HabitCategory }>(),
  { categoryFilter: 'all' },
);

const emit = defineEmits<{
  toggle: [habitId: string, day: DayKey];
  edit: [habitId: string];
  delete: [habitId: string];
  add: [];
  clearFilter: [];
}>();

const store = useHabitStore();

function statsFor(habitId: string): HabitStats {
  return store.habitStats(habitId, props.days);
}
</script>

<template>
  <div>
    <EmptyState
      v-if="habits.length === 0"
      :title="categoryFilter === 'all' ? 'No habits yet' : 'No habits found'"
      :description="categoryFilter === 'all'
        ? 'Track your first habit and start building a contribution streak.'
        : 'No habits match this category filter. Try a different category or clear the filter.'"
    >
      <template #action>
        <BaseButton
          v-if="categoryFilter === 'all'"
          variant="primary"
          @click="emit('add')"
        >
          New habit
        </BaseButton>
        <BaseButton
          v-else
          variant="ghost"
          @click="emit('clearFilter')"
        >
          Show all habits
        </BaseButton>
      </template>
    </EmptyState>
    <div
      v-else
      class="grid grid-cols-1 gap-4 xl:grid-cols-2"
    >
      <HabitCard
        v-for="habit in habits"
        :key="habit.id"
        :habit="habit"
        :days="days"
        :stats="statsFor(habit.id)"
        @toggle="(habitId, day) => emit('toggle', habitId, day)"
        @edit="emit('edit', habit.id)"
        @delete="emit('delete', habit.id)"
      />
    </div>
  </div>
</template>