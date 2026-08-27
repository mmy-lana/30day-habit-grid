<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ level?: 1 | 2 | 3; text: string }>(), { level: 2 });

const sizeClasses = computed(() => {
  switch (props.level) {
    case 1:
      return 'text-2xl font-bold';
    case 2:
      return 'text-xl font-semibold';
    default:
      return 'text-lg font-semibold';
  }
});
</script>

<template>
  <h1
    v-if="level === 1"
    :class="['text-gh-text', sizeClasses]"
  >
    {{ text }}
  </h1>
  <h2
    v-else-if="level === 2"
    :class="['text-gh-text', sizeClasses]"
  >
    {{ text }}
  </h2>
  <h3
    v-else
    :class="['text-gh-text', sizeClasses]"
  >
    {{ text }}
  </h3>
</template>