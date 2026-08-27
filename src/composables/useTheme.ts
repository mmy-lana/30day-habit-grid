import { computed, onUnmounted, watch } from 'vue';
import type { ComputedRef } from 'vue';
import { useHabitStore } from '@/composables/useHabitStore';

const STORAGE_KEY = 'habit-grid:v1';

// Shared across instances so a choice made in HomePage also disables the
// system-preference listener registered by App.init().
let explicitChoice = false;

/**
 * Keeps the `.dark` class on `<html>` in sync with the persisted theme choice.
 * Seeds from `prefers-color-scheme` on first run (defaulting to dark) and keeps
 * listening to system changes until the user explicitly picks a theme.
 */
export function useTheme() {
  const store = useHabitStore();
  let mediaQuery: MediaQueryList | null = null;

  const isDark: ComputedRef<boolean> = computed(() => store.theme.value === 'dark');

  function apply(): void {
    document.documentElement.classList.toggle('dark', isDark.value);
  }

  function setTheme(theme: 'light' | 'dark'): void {
    explicitChoice = true;
    store.setTheme(theme);
  }

  function toggleTheme(): void {
    explicitChoice = true;
    store.toggleTheme();
  }

  const handleSystemChange = (): void => {
    if (explicitChoice) return;
    const prefersDark = mediaQuery?.matches ?? true;
    store.setTheme(prefersDark ? 'dark' : 'light');
  };

  function init(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const hasStoredChoice = localStorage.getItem(STORAGE_KEY) != null;
    if (!hasStoredChoice) {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
      store.setTheme(prefersDark ? 'dark' : 'light');
    }
    mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
    mediaQuery?.addEventListener('change', handleSystemChange);
  }

  watch(isDark, apply, { immediate: true });

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handleSystemChange);
  });

  return { isDark, toggleTheme, setTheme, init };
}