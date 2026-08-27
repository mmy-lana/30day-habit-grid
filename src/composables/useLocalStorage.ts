import { ref, watch } from 'vue';
import type { Ref } from 'vue';

/**
 * Persistent reactive ref. Reads from `localStorage` once, writes back on deep change.
 * Writes are debounced via `requestIdleCallback` with a `setTimeout` fallback.
 * SSR-safe: silently no-ops when `localStorage`/`window` are unavailable.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T | (() => T),
  options?: { version?: number }, // namespace key with :v{version} suffix
): {
  value: Ref<T>; // deeply reactive; writes are JSON-serialized on change
} {
  const storageKey = options?.version != null ? `${key}:v${options.version}` : key;

  const resolveInitial = (): T => {
    if (typeof initial === 'function') {
      return (initial as unknown as () => T)();
    }
    // Clone so mutations on the reactive ref never leak into shared constant objects.
    return structuredClone(initial);
  };

  const readStored = (): T | null => {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      // Corrupt or unparseable payload — fall back to the initial value.
      return null;
    }
  };

  const value = ref(readStored() ?? resolveInitial()) as unknown as Ref<T>;

  const write = (): void => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value.value));
    } catch {
      // Storage quota exceeded or serialization failure — persistence is best-effort.
    }
  };

  const scheduleWrite = (): void => {
    if (typeof window === 'undefined') return;
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(write, { timeout: 120 });
    } else {
      window.setTimeout(write, 120);
    }
  };

  watch(value, scheduleWrite, { deep: true });

  return { value };
}