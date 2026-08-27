<script setup lang="ts">
import ColorDot from './ColorDot.vue';

withDefaults(defineProps<{ text?: string; color?: string }>(), {
  text: undefined,
  color: undefined,
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full bg-gh-border/40 px-2 py-0.5 text-xs font-medium text-gh-text"
  >
    <ColorDot
      v-if="color"
      :color="color"
      size="xs"
    />
    <slot>{{ text }}</slot>
  </span>
</template>