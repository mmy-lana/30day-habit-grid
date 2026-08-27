import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StatsHeader from '@/components/molecules/StatsHeader.vue';
import type { Habit } from '@/types/habit';
import type { HabitStats } from '@/types/stats';

const habit: Habit = {
  id: 'habit-1',
  name: 'Morning run',
  category: 'fitness',
  emoji: '🏃',
  createdAt: '2026-08-01T08:00:00.000Z',
};

const stats: HabitStats = {
  habitId: 'habit-1',
  currentStreak: 0,
  longestStreak: 0,
  totalCompletions: 0,
  completionRate: 0,
  windowSize: 30,
};

describe('StatsHeader', () => {
  it('renders the "check in" pill in the not-done state', () => {
    const wrapper = mount(StatsHeader, {
      props: { habit, stats, isDoneToday: false },
    });
    const pill = wrapper.find('button[aria-pressed="false"]');
    expect(pill.exists()).toBe(true);
    expect(pill.attributes('aria-label')).toBe('Mark today as done');
    expect(pill.text()).toBe('+ Check in today');
  });

  it('emits toggleToday when the check-in pill is clicked', async () => {
    const wrapper = mount(StatsHeader, {
      props: { habit, stats, isDoneToday: false },
    });
    const pill = wrapper.find('button[aria-label="Mark today as done"]');
    await pill.trigger('click');
    expect(wrapper.emitted('toggleToday')?.[0]).toEqual([]);
  });

  it('flips to the "done" pill when isDoneToday is true', () => {
    const wrapper = mount(StatsHeader, {
      props: { habit, stats, isDoneToday: true },
    });
    const pill = wrapper.find('button[aria-pressed="true"]');
    expect(pill.exists()).toBe(true);
    expect(pill.attributes('aria-label')).toBe('Mark today as not done');
    expect(pill.text()).toBe('✓ Done today');
  });

  it('uses distinct class branches for the done and not-done pills', () => {
    const notDone = mount(StatsHeader, {
      props: { habit, stats, isDoneToday: false },
    });
    const notDoneClasses = notDone.find('button[aria-label="Mark today as done"]').attributes('class') ?? '';
    expect(notDoneClasses).toContain('border border-gh-border');
    expect(notDoneClasses).toContain('bg-transparent');
    expect(notDoneClasses).not.toContain('bg-level-4');

    const done = mount(StatsHeader, {
      props: { habit, stats, isDoneToday: true },
    });
    const doneClasses = done.find('button[aria-label="Mark today as not done"]').attributes('class') ?? '';
    expect(doneClasses).toContain('bg-level-4');
    expect(doneClasses).toContain('text-gh-bg');
    expect(doneClasses).not.toContain('border-gh-border');
  });
});
