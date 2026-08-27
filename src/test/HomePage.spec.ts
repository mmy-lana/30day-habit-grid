import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { DOMWrapper, VueWrapper } from '@vue/test-utils';
import type { DayKey } from '@/types/habit';
import { lastNDays } from '@/utils/date';

const flushWrites = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 130));

const CELL_SELECTOR = 'button[role="button"][aria-pressed]';

function habitGridCells(wrapper: VueWrapper): DOMWrapper<Element>[] {
  const grid = wrapper.find('[aria-label="Morning run — last 30 days"]');
  return grid.findAll(CELL_SELECTOR);
}

async function mountHomePage() {
  const { default: HomePage } = await import('@/pages/HomePage.vue');
  return mount(HomePage, { attachTo: document.body });
}

async function submitHabitForm(name: string): Promise<void> {
  const nameInput = document.body.querySelector<HTMLInputElement>('#habit-name');
  if (!nameInput) throw new Error('habit name input not found in modal');
  nameInput.value = name;
  nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  const form = document.body.querySelector('form');
  if (!form) throw new Error('habit form not found in modal');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('HomePage smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('adds a habit, toggles today, shows streak 1, and persists across a remount', async () => {
    const wrapper = await mountHomePage();

    const newHabitButton = wrapper.findAll('button').find((button) => button.text() === 'New habit');
    if (newHabitButton) await newHabitButton.trigger('click');

    await vi.waitFor(() => {
      expect(document.body.querySelector('#habit-name')).not.toBeNull();
    });
    await submitHabitForm('Morning run');

    await vi.waitFor(() => {
      expect(habitGridCells(wrapper)).toHaveLength(30);
    });

    const cells = habitGridCells(wrapper);
    const todayCell = cells[cells.length - 1];
    if (todayCell) await todayCell.trigger('click');

    const { useHabitStore } = await import('@/composables/useHabitStore');
    const store = useHabitStore();
    const habitId = store.habits.value[0]?.id;
    expect(habitId).toBeTruthy();
    const days: DayKey[] = lastNDays(30, new Date());
    const stats = habitId ? store.habitStats(habitId, days) : null;
    const doneMap = habitId ? (store.completions.value[habitId] ?? {}) : {};
    const doneKeys = Object.keys(doneMap);
    expect(doneKeys.length).toBe(1);
    expect(doneKeys[0]).toBe(days[29]);
    expect(stats?.totalCompletions).toBe(1);
    expect(stats?.currentStreak).toBe(1);

    const cellsAfter = habitGridCells(wrapper);
    expect(cellsAfter[cellsAfter.length - 1]?.attributes('aria-pressed')).toBe('true');

    await flushWrites();
    wrapper.unmount();
    document.body.innerHTML = '';

    vi.resetModules();
    const wrapper2 = await mountHomePage();
    await vi.waitFor(() => {
      expect(habitGridCells(wrapper2)).toHaveLength(30);
    });
    const cells2 = habitGridCells(wrapper2);
    expect(cells2[cells2.length - 1]?.attributes('aria-pressed')).toBe('true');

    wrapper2.unmount();
  });
});