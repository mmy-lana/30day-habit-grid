<script setup lang="ts">
withDefaults(defineProps<{ label: string; disabled?: boolean }>(), { disabled: false });

const emit = defineEmits<{ click: [evt: MouseEvent] }>();

const onClick = (evt: MouseEvent): void => emit('click', evt);
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-gh-muted transition-colors hover:bg-gh-border/40 hover:text-gh-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-level-4 disabled:pointer-events-none disabled:opacity-40"
    @click="onClick"
  >
    <slot />
  </button>
</template>