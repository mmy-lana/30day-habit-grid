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
          <path d="M8 1.5a.75.75 0 0 1 .75.75v5.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L7.25 7.94V2.25A.75.75 0 0 1 8 1.5Z" />
          <path d="M2.5 12.75a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z" />
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
          <path d="M7.25 7.94 5.03 5.72a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 7.94V2.25a.75.75 0 0 0-1.5 0v5.69Z" />
          <path d="M2.5 12.75a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z" />
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