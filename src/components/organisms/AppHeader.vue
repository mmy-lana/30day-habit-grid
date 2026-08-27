<script setup lang="ts">
import type { GlobalStats } from '@/types/stats';
import AppLogo from '@/components/atoms/AppLogo.vue';
import StatTile from '@/components/atoms/StatTile.vue';
import ThemeToggle from '@/components/atoms/ThemeToggle.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import IconButton from '@/components/atoms/IconButton.vue';

withDefaults(defineProps<{ globalStats: GlobalStats; isDark: boolean }>(), {});
const emit = defineEmits<{ toggleTheme: []; addHabit: [] }>();
</script>

<template>
  <header class="flex items-center justify-between gap-3 py-4">
    <AppLogo />
    <div class="hidden items-center gap-6 md:flex">
      <StatTile
        label="Habits"
        :value="globalStats.totalHabits"
      />
      <StatTile
        label="Completions"
        :value="globalStats.totalCompletions"
      />
      <StatTile
        label="Best streak"
        :value="globalStats.bestStreak"
        tone="accent"
      />
    </div>
    <div class="flex items-center gap-1">
      <ThemeToggle
        :is-dark="isDark"
        @toggle="emit('toggleTheme')"
      />
      <div class="hidden md:block">
        <BaseButton
          variant="primary"
          size="sm"
          @click="emit('addHabit')"
        >
          New habit
        </BaseButton>
      </div>
      <div class="md:hidden">
        <IconButton
          label="New habit"
          @click="emit('addHabit')"
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M8 1.75a.75.75 0 0 1 .75.75v4.75h4.75a.75.75 0 0 1 0 1.5H8.75v4.75a.75.75 0 0 1-1.5 0V8.75H2.5a.75.75 0 0 1 0-1.5h4.75V2.5A.75.75 0 0 1 8 1.75Z"
            />
          </svg>
        </IconButton>
      </div>
    </div>
  </header>
</template>