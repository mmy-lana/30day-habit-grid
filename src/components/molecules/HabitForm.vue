<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { Habit, HabitCategory, HabitInput } from '@/types/habit';
import { CATEGORIES } from '@/constants/habits';
import { sanitizeText } from '@/utils/text';
import BaseButton from '@/components/atoms/BaseButton.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import SelectInput from '@/components/atoms/SelectInput.vue';
import EmojiInput from '@/components/atoms/EmojiInput.vue';

const props = withDefaults(defineProps<{ habit?: Habit | null }>(), { habit: null });

const emit = defineEmits<{ submit: [input: HabitInput]; cancel: [] }>();

const isEditing = computed(() => props.habit != null);

const form = reactive<{ name: string; category: HabitCategory; emoji?: string }>({
  name: props.habit?.name ?? '',
  category: props.habit?.category ?? 'health',
  emoji: props.habit?.emoji ?? undefined,
});

watch(
  () => props.habit,
  (habit) => {
    form.name = habit?.name ?? '';
    form.category = habit?.category ?? 'health';
    form.emoji = habit?.emoji ?? undefined;
  },
);

const error = computed(() => (sanitizeText(form.name, 40).length === 0 ? 'Name is required.' : undefined));
const canSubmit = computed(() => error.value == null);

function onCategoryChange(value: string): void {
  const match = CATEGORIES.find((category) => category.value === value);
  if (match) form.category = match.value;
}

function onSubmit(): void {
  if (!canSubmit.value) return;
  emit('submit', {
    name: sanitizeText(form.name, 40),
    category: form.category,
    emoji: form.emoji,
  });
}
</script>

<template>
  <form
    class="flex flex-col gap-4"
    novalidate
    @submit.prevent="onSubmit"
  >
    <TextInput
      id="habit-name"
      v-model="form.name"
      label="Name"
      placeholder="e.g. Morning run"
      :max-length="40"
      :error="error"
      autofocus
    />
    <SelectInput
      v-model="form.category"
      :options="CATEGORIES"
      label="Category"
      @update:model-value="onCategoryChange"
    />
    <EmojiInput v-model="form.emoji" />
    <div class="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <BaseButton
        type="button"
        variant="subtle"
        @click="emit('cancel')"
      >
        Cancel
      </BaseButton>
      <BaseButton
        type="submit"
        variant="primary"
        :disabled="!canSubmit"
      >
        {{ isEditing ? 'Save changes' : 'Add habit' }}
      </BaseButton>
    </div>
  </form>
</template>