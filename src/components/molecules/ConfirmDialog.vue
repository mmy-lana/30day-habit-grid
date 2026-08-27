<script setup lang="ts">
import Modal from './Modal.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
  }>(),
  { confirmText: 'Confirm', danger: false },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <Modal
    :open="open"
    :title="title"
    size="sm"
    @close="emit('cancel')"
  >
    <p class="text-sm text-gh-muted">
      {{ message }}
    </p>
    <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <BaseButton
        variant="subtle"
        @click="emit('cancel')"
      >
        Cancel
      </BaseButton>
      <BaseButton
        :variant="danger ? 'danger' : 'primary'"
        @click="emit('confirm')"
      >
        {{ confirmText }}
      </BaseButton>
    </div>
  </Modal>
</template>