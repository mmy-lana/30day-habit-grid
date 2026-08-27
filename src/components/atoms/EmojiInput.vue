<script setup lang="ts">
import { EMOJI_PRESETS } from '@/constants/habits';

withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: undefined });

const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <span class="text-xs font-medium text-gh-muted">Emoji (optional)</span>
    <div class="flex flex-wrap gap-1">
      <button
        v-for="emoji in EMOJI_PRESETS"
        :key="emoji"
        type="button"
        :aria-pressed="modelValue === emoji"
        :aria-label="`Select emoji ${emoji}`"
        :class="[
          'flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors',
          modelValue === emoji
            ? 'border-level-4 bg-level-4/10'
            : 'border-gh-border hover:bg-gh-border/30',
        ]"
        @click="emit('update:modelValue', emoji)"
      >
        {{ emoji }}
      </button>
      <button
        v-if="modelValue"
        type="button"
        class="flex h-9 items-center justify-center rounded-md border border-gh-border px-2 text-xs text-gh-muted hover:bg-gh-border/30"
        @click="emit('update:modelValue', undefined)"
      >
        Clear
      </button>
    </div>
  </div>
</template>