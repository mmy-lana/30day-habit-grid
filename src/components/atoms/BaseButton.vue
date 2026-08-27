<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger' | 'subtle';
    size?: 'sm' | 'md';
    type?: 'button' | 'submit';
    disabled?: boolean;
    block?: boolean;
  }>(),
  { variant: 'subtle', size: 'md', type: 'button', disabled: false, block: false },
);

const emit = defineEmits<{ click: [evt: MouseEvent] }>();

const variantClasses = {
  primary: 'bg-level-4 text-gh-bg hover:opacity-90',
  ghost: 'border border-gh-border bg-transparent text-gh-text hover:bg-gh-border/30',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  subtle: 'bg-gh-border/40 text-gh-text hover:bg-gh-border/60',
} as const;

const sizeClasses = {
  sm: 'gap-1 px-2.5 py-1 text-xs',
  md: 'gap-1.5 px-4 py-2 text-sm',
} as const;

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-level-4',
  'disabled:pointer-events-none disabled:opacity-50',
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.block ? 'w-full' : '',
]);

const onClick = (evt: MouseEvent): void => emit('click', evt);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="classes"
    @click="onClick"
  >
    <span
      v-if="$slots.icon"
      class="inline-flex"
    >
      <slot name="icon" />
    </span>
    <slot />
  </button>
</template>