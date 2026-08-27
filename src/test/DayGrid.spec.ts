import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DayGrid from '@/components/molecules/DayGrid.vue';
import DayCell from '@/components/atoms/DayCell.vue';
import { lastNDays } from '@/utils/date';
import type { DayKey, IntensityLevel } from '@/types/habit';

const days: DayKey[] = lastNDays(30, new Date(2026, 7, 27));

describe('DayGrid', () => {
  it('renders one DayCell per day', () => {
    const wrapper = mount(DayGrid, {
      props: {
        days,
        intensityFor: (): IntensityLevel => 0,
      },
    });
    expect(wrapper.findAllComponents(DayCell)).toHaveLength(30);
  });

  it('passes intensity and labels through to cells', () => {
    const wrapper = mount(DayGrid, {
      props: {
        days: days.slice(0, 3),
        intensityFor: (): IntensityLevel => 4,
        labelFor: (day: DayKey): string => `Day ${day}`,
      },
    });
    const cells = wrapper.findAllComponents(DayCell);
    expect(cells[0]?.props('intensity')).toBe(4);
    expect(cells[0]?.props('label')).toBe(`Day ${days[0]}`);
  });

  it('emits toggle with the clicked day key', async () => {
    const wrapper = mount(DayGrid, {
      props: {
        days,
        intensityFor: (): IntensityLevel => 0,
      },
    });
    const cells = wrapper.findAllComponents(DayCell);
    const target = cells[3];
    if (target) await target.trigger('click');
    expect(wrapper.emitted('toggle')?.[0]).toEqual([days[3]]);
  });

  it('suppresses clicks when readonly', async () => {
    const wrapper = mount(DayGrid, {
      props: {
        days,
        readonly: true,
        intensityFor: (): IntensityLevel => 0,
      },
    });
    const cells = wrapper.findAllComponents(DayCell);
    const target = cells[0];
    if (target) await target.trigger('click');
    expect(wrapper.emitted('toggle')).toBeUndefined();
  });
});