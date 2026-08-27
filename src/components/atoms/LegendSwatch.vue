<script setup lang="ts">
import type { IntensityLevel } from '@/types/habit';

withDefaults(defineProps<{ level: IntensityLevel }>(), {});
</script>

<template>
  <span
    aria-hidden="true"
    class="inline-block h-[10px] w-[10px] rounded-[2px]"
    :style="{ backgroundColor: `var(--gh-level-${level})` }"
  />
</template>