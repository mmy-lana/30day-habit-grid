<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    options: { value: string; label: string }[];
    label?: string;
  }>(),
  { label: undefined },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function onChange(evt: Event): void {
  emit('update:modelValue', (evt.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      v-if="label"
      class="text-xs font-medium text-gh-muted"
    >{{ label }}</label>
    <select
      :value="modelValue"
      class="rounded-md border border-gh-border bg-gh-bg px-3 py-2 text-sm text-gh-text focus:border-level-4 focus:outline-none focus:ring-1 focus:ring-level-4"
      @change="onChange"
    >
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>