<script setup lang="ts">
import type { IntensityLevel } from '@/types/habit';
import LegendSwatch from '@/components/atoms/LegendSwatch.vue';

withDefaults(defineProps<{ max?: number }>(), { max: undefined });

const levels: IntensityLevel[] = [0, 1, 2, 3, 4];
</script>

<template>
  <div class="flex items-center gap-1 text-xs text-gh-muted">
    <span
      v-if="max != null"
      class="mr-2 font-medium"
    >{{ max }} habits</span>
    <span>Less</span>
    <LegendSwatch
      v-for="level in levels"
      :key="level"
      :level="level"
    />
    <span>More</span>
  </div>
</template>