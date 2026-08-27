<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    placeholder?: string;
    maxLength?: number;
    error?: string;
    id?: string;
  }>(),
  {
    label: undefined,
    placeholder: undefined,
    maxLength: undefined,
    error: undefined,
    id: undefined,
  },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function onInput(evt: Event): void {
  emit('update:modelValue', (evt.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      v-if="label"
      :for="id ?? undefined"
      class="text-xs font-medium text-gh-muted"
    >
      {{ label }}
    </label>
    <input
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :aria-invalid="error != null"
      class="rounded-md border border-gh-border bg-gh-bg px-3 py-2 text-sm text-gh-text placeholder:text-gh-muted focus:border-level-4 focus:outline-none focus:ring-1 focus:ring-level-4"
      @input="onInput"
    >
    <p
      v-if="error"
      class="text-xs text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>