<script setup lang="ts">
withDefaults(defineProps<{ title: string; description?: string }>(), { description: undefined });
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gh-border bg-gh-panel px-6 py-16 text-center"
  >
    <p class="text-base font-semibold text-gh-text">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="max-w-sm text-sm text-gh-muted"
    >
      {{ description }}
    </p>
    <div class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>