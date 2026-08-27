<script setup lang="ts">
import { ref } from 'vue';
import type { GlobalStats } from '@/types/stats';
import AppLogo from '@/components/atoms/AppLogo.vue';
import StatTile from '@/components/atoms/StatTile.vue';
import ThemeToggle from '@/components/atoms/ThemeToggle.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import IconButton from '@/components/atoms/IconButton.vue';

withDefaults(defineProps<{ globalStats: GlobalStats; isDark: boolean }>(), {});
const emit = defineEmits<{
  toggleTheme: [];
  addHabit: [];
  exportData: [];
  importFile: [file: File];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

function onExportClick(): void {
  emit('exportData');
}

function onImportClick(): void {
  fileInputRef.value?.click();
}

function onFileChange(evt: Event): void {
  const input = evt.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) emit('importFile', file);
  input.value = ''; // allow re-importing the same file
}
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
      <IconButton
        label="Export backup"
        @click="onExportClick"
      >
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
          <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
        </svg>
      </IconButton>
      <IconButton
        label="Import backup"
        @click="onImportClick"
      >
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M7.25 10.25a.75.75 0 0 0 1.5 0V4.56l2.22 2.22a.75.75 0 1 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 0 0 1.06 1.06l2.22-2.22v5.69Z" />
          <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
        </svg>
      </IconButton>
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
  <input
    ref="fileInputRef"
    type="file"
    accept=".json"
    class="hidden"
    @change="onFileChange"
  >
</template>