<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import IconButton from '@/components/atoms/IconButton.vue';

const props = withDefaults(
  defineProps<{ open: boolean; title: string; size?: 'sm' | 'md' }>(),
  { size: 'md' },
);

const emit = defineEmits<{ close: [] }>();

const panelRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableElements(): HTMLElement[] {
  if (!panelRef.value) return [];
  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

async function onOpenChange(isOpen: boolean): Promise<void> {
  if (isOpen) {
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    await nextTick();
    const first = focusableElements()[0];
    if (first) first.focus();
  } else {
    previouslyFocused?.focus();
    previouslyFocused = null;
  }
}

watch(
  () => props.open,
  (isOpen) => void onOpenChange(isOpen),
);

function onKeydown(evt: KeyboardEvent): void {
  if (evt.key === 'Escape') {
    emit('close');
    return;
  }
  if (evt.key !== 'Tab') return;
  const focusable = focusableElements();
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (first == null || last == null) return;
  const active = document.activeElement;
  const focusInside = panelRef.value?.contains(active) ?? false;
  if (evt.shiftKey) {
    if (active === first || !focusInside) {
      evt.preventDefault();
      last.focus();
    }
  } else if (active === last || !focusInside) {
    evt.preventDefault();
    first.focus();
  }
}

onBeforeUnmount(() => {
  previouslyFocused?.focus();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @keydown="onKeydown"
      >
        <div
          class="absolute inset-0 bg-black/50"
          aria-hidden="true"
          @click="emit('close')"
        />
        <div
          ref="panelRef"
          class="panel relative flex max-h-[85dvh] w-full flex-col rounded-t-2xl border border-gh-border bg-gh-panel shadow-xl"
          :class="size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-md'"
        >
          <div
            class="flex items-center justify-between border-b border-gh-border px-4 py-3 sm:px-6"
          >
            <h2 class="text-base font-semibold text-gh-text">
              {{ title }}
            </h2>
            <IconButton
              label="Close dialog"
              @click="emit('close')"
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
                />
              </svg>
            </IconButton>
          </div>
          <div
            class="overflow-y-auto px-4 py-4 sm:px-6"
            style="padding-bottom: max(1rem, env(safe-area-inset-bottom))"
          >
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .panel,
.modal-leave-active .panel {
  transition:
    transform 0.15s ease,
    border-radius 0.15s ease;
}
.modal-enter-from .panel,
.modal-leave-to .panel {
  transform: translateY(24px) scale(0.98);
}
</style>