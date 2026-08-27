import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import HabitList from '@/components/organisms/HabitList.vue';
import HabitCard from '@/components/organisms/HabitCard.vue';
import type { DayKey, Habit } from '@/types/habit';
import { lastNDays } from '@/utils/date';

const habit: Habit = {
  id: 'h1',
  name: 'Read',
  category: 'learning',
  emoji: '📚',
  createdAt: '2026-08-01T00:00:00.000Z',
};

const days: DayKey[] = lastNDays(30, new Date(2026, 7, 27));

describe('HabitList', () => {
  it('shows the no-habits empty state with a New habit CTA when the filter is "all"', () => {
    const wrapper = mount(HabitList, { props: { habits: [], days, categoryFilter: 'all' } });
    expect(wrapper.text()).toContain('No habits yet');
    const actionButton = wrapper.findAll('button').find((button) => button.text() === 'New habit');
    expect(actionButton?.text()).toBe('New habit');
    expect(wrapper.findAllComponents(HabitCard)).toHaveLength(0);
  });

  it('shows the filter-empty state with a Show all habits CTA when the filter matches nothing', () => {
    const wrapper = mount(HabitList, { props: { habits: [], days, categoryFilter: 'fitness' } });
    expect(wrapper.text()).toContain('No habits found');
    const actionButton = wrapper.findAll('button').find((button) => button.text() === 'Show all habits');
    expect(actionButton?.text()).toBe('Show all habits');
    expect(wrapper.text()).not.toContain('New habit');
  });

  it('emits clearFilter when "Show all habits" is clicked', async () => {
    const wrapper = mount(HabitList, { props: { habits: [], days, categoryFilter: 'fitness' } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('clearFilter')?.[0]).toEqual([]);
  });

  it('renders a HabitCard per habit when the list is non-empty', () => {
    const wrapper = mount(HabitList, { props: { habits: [habit], days, categoryFilter: 'all' } });
    expect(wrapper.findAllComponents(HabitCard)).toHaveLength(1);
    expect(wrapper.text()).not.toContain('No habits yet');
  });
});