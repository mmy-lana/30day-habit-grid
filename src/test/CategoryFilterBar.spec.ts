import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CategoryFilterBar from '@/components/molecules/CategoryFilterBar.vue';
import ColorDot from '@/components/atoms/ColorDot.vue';

describe('CategoryFilterBar', () => {
  it('renders 7 pills with the correct labels in order', () => {
    const wrapper = mount(CategoryFilterBar);
    const pills = wrapper.findAll('button');
    expect(pills).toHaveLength(7);
    expect(pills.map((pill) => pill.text())).toEqual([
      'All',
      'Health',
      'Learning',
      'Fitness',
      'Mindfulness',
      'Creativity',
      'Social',
    ]);
  });

  it('"All" is active by default; categories are inactive', () => {
    const wrapper = mount(CategoryFilterBar);
    const pills = wrapper.findAll('button');
    expect(pills[0]?.attributes('aria-pressed')).toBe('true');
    for (let index = 1; index < pills.length; index++) {
      expect(pills[index]?.attributes('aria-pressed')).toBe('false');
    }
  });

  it('clicking "Health" emits update:modelValue with "health"', async () => {
    const wrapper = mount(CategoryFilterBar);
    await wrapper.findAll('button')[1]?.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['health']);
  });

  it('setting modelValue="fitness" marks the Fitness pill active', () => {
    const wrapper = mount(CategoryFilterBar, { props: { modelValue: 'fitness' } });
    const pills = wrapper.findAll('button');
    for (let index = 0; index < pills.length; index++) {
      const expected = index === 3 ? 'true' : 'false';
      expect(pills[index]?.attributes('aria-pressed')).toBe(expected);
    }
  });

  it('ColorDot present on category pills, absent on "All"', () => {
    const wrapper = mount(CategoryFilterBar);
    expect(wrapper.findAllComponents(ColorDot)).toHaveLength(6);
    expect(wrapper.findAll('button')[0]?.findComponent(ColorDot).exists()).toBe(false);
  });

  it('clicking the already-active pill does not emit', async () => {
    const wrapper = mount(CategoryFilterBar);
    await wrapper.findAll('button')[0]?.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});