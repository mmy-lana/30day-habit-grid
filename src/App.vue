<script setup lang="ts">
import { onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import HomePage from '@/pages/HomePage.vue';

const theme = useTheme();

onMounted(() => {
  theme.init();
});
</script>

<template>
  <div class="app-shell mx-auto min-h-dvh w-full max-w-6xl bg-gh-bg px-4 py-6 text-gh-text sm:px-6 lg:px-8">
    <HomePage />
  </div>
</template>