import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import HabitCard from '@/components/organisms/HabitCard.vue';
import DayCell from '@/components/atoms/DayCell.vue';
import type { DayKey, Habit } from '@/types/habit';
import type { HabitStats } from '@/types/stats';
import { lastNDays } from '@/utils/date';

const habit: Habit = {
  id: 'habit-1',
  name: 'Morning run',
  category: 'fitness',
  emoji: '🏃',
  createdAt: '2026-08-01T08:00:00.000Z',
};

const days: DayKey[] = lastNDays(30, new Date(2026, 7, 27));

const stats: HabitStats = {
  habitId: 'habit-1',
  currentStreak: 0,
  longestStreak: 0,
  totalCompletions: 0,
  completionRate: 0,
  windowSize: 30,
};

describe('HabitCard', () => {
  it('renders a grid with 30 day cells', () => {
    const wrapper = mount(HabitCard, { props: { habit, days, stats } });
    expect(wrapper.findAllComponents(DayCell)).toHaveLength(30);
  });

  it('emits toggle with habit id and day key when a cell is clicked', async () => {
    const wrapper = mount(HabitCard, { props: { habit, days, stats } });
    const cells = wrapper.findAllComponents(DayCell);
    const target = cells[0];
    if (target) await target.trigger('click');
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['habit-1', days[0]]);
  });

  it('emits edit and delete with the habit id', async () => {
    const wrapper = mount(HabitCard, { props: { habit, days, stats } });
    const editButton = wrapper.find('button[aria-label="Edit habit"]');
    await editButton.trigger('click');
    expect(wrapper.emitted('edit')?.[0]).toEqual(['habit-1']);

    const deleteButton = wrapper.find('button[aria-label="Delete habit"]');
    await deleteButton.trigger('click');
    expect(wrapper.emitted('delete')?.[0]).toEqual(['habit-1']);
  });

  it('renders the check-in pill in the not-done state', () => {
    const wrapper = mount(HabitCard, { props: { habit, days, stats } });
    const pill = wrapper.find('button[aria-label="Mark today as done"]');
    expect(pill.exists()).toBe(true);
    expect(pill.text()).toBe('+ Check in today');
    expect(pill.attributes('aria-pressed')).toBe('false');
  });

  it("clicking the check-in pill emits toggle with habit id and today's key", async () => {
    const wrapper = mount(HabitCard, { props: { habit, days, stats } });
    const pill = wrapper.find('button[aria-label="Mark today as done"]');
    await pill.trigger('click');
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['habit-1', days[29]]);
  });
});