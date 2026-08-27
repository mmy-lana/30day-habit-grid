import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useDateGrid } from '@/composables/useDateGrid';

const Host = defineComponent({
  setup() {
    const grid = useDateGrid(30, new Date(2026, 7, 27));
    return () => h('div', { id: 'grid-host' }, grid.dayKeys.value.join(','));
  },
});

describe('useDateGrid day rollover', () => {
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  it('recomputes the rolling window on tab focus after midnight', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 27));

    const wrapper = mount(Host);
    expect(wrapper.text()).toContain('2026-07-29');
    expect(wrapper.text()).toContain('2026-08-27');

    vi.setSystemTime(new Date(2026, 7, 28));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    await nextTick();
    expect(wrapper.text()).toContain('2026-07-30');
    expect(wrapper.text()).toContain('2026-08-28');

    wrapper.unmount();
  });

  it('keeps the window fixed while the tab stays hidden', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 27));

    const wrapper = mount(Host);
    expect(wrapper.text()).toContain('2026-08-27');

    vi.setSystemTime(new Date(2026, 7, 28));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    await nextTick();
    expect(wrapper.text()).toContain('2026-08-27');

    wrapper.unmount();
  });
});