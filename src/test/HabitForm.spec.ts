import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import HabitForm from '@/components/molecules/HabitForm.vue';
import type { Habit } from '@/types/habit';

const existingHabit: Habit = {
  id: 'habit-1',
  name: 'Morning run',
  category: 'fitness',
  emoji: '🏃',
  createdAt: '2026-08-01T08:00:00.000Z',
};

describe('HabitForm', () => {
  it('disables submit while the name is empty', () => {
    const wrapper = mount(HabitForm);
    const submit = wrapper.find('button[type="submit"]');
    expect(submit.attributes('disabled')).toBeDefined();
  });

  it('submits a trimmed HabitInput', async () => {
    const wrapper = mount(HabitForm);
    const nameInput = wrapper.find('#habit-name');
    await nameInput.setValue('  Morning run  ');
    await wrapper.find('form').trigger('submit');
    const submitted = wrapper.emitted('submit');
    expect(submitted?.[0]?.[0]).toEqual({
      name: 'Morning run',
      category: 'health',
      emoji: undefined,
    });
  });

  it('pre-fills values in edit mode and submits them', async () => {
    const wrapper = mount(HabitForm, { props: { habit: existingHabit } });
    await wrapper.find('form').trigger('submit');
    const submitted = wrapper.emitted('submit');
    expect(submitted?.[0]?.[0]).toEqual({
      name: 'Morning run',
      category: 'fitness',
      emoji: '🏃',
    });
  });

  it('emits cancel', async () => {
    const wrapper = mount(HabitForm);
    const cancelButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Cancel');
    if (cancelButton) await cancelButton.trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });
});