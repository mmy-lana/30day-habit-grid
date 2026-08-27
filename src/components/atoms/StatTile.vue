<script setup lang="ts">
withDefaults(
  defineProps<{ label: string; value: string | number; hint?: string; tone?: 'default' | 'accent' }>(),
  { hint: undefined, tone: 'default' },
);
</script>

<template>
  <div class="flex flex-col leading-tight">
    <span class="text-xs text-gh-muted">{{ label }}</span>
    <span
      class="text-lg font-semibold tabular-nums"
      :class="tone === 'accent' ? 'text-level-4' : 'text-gh-text'"
    >
      {{ value }}
    </span>
    <span
      v-if="hint"
      class="text-xs text-gh-muted"
    >{{ hint }}</span>
  </div>
</template>