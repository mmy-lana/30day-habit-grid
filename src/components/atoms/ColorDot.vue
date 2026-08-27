<script setup lang="ts">
withDefaults(defineProps<{ color: string; size?: 'xs' | 'sm' }>(), { size: 'sm' });
</script>

<template>
  <span
    aria-hidden="true"
    class="inline-block shrink-0 rounded-full"
    :class="size === 'xs' ? 'h-2 w-2' : 'h-2.5 w-2.5'"
    :style="{ backgroundColor: color }"
  />
</template>