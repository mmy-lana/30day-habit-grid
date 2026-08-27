<script setup lang="ts">
import IconButton from './IconButton.vue';

withDefaults(defineProps<{ isDark: boolean }>(), {});
const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <IconButton
    :label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :aria-pressed="isDark"
    @click="emit('toggle')"
  >
    <svg
      v-if="isDark"
      viewBox="0 0 16 16"
      fill="currentColor"
      class="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1Zm0 11a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 12Zm7-4a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8ZM3 8a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8Zm9.53-4.47a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm-6.36 6.36a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm6.36 0a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM5.83 3.53a.75.75 0 0 1 0 1.06L4.77 5.65a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Z"
      />
    </svg>
    <svg
      v-else
      viewBox="0 0 16 16"
      fill="currentColor"
      class="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.5 5.5 0 1 0 7.678-7.678Z"
      />
    </svg>
  </IconButton>
</template>