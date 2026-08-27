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

  it('marks the last cell as today and no others', () => {
    const wrapper = mount(DayGrid, {
      props: {
        days,
        intensityFor: (): IntensityLevel => 0,
      },
    });
    const cells = wrapper.findAllComponents(DayCell);
    expect(cells[29]?.props('isToday')).toBe(true);
    for (let i = 0; i < 29; i++) {
      expect(cells[i]?.props('isToday')).toBe(false);
    }
  });

  it("prefixes today's cell tooltip with 'Today — '", () => {
    const wrapper = mount(DayGrid, {
      props: {
        days,
        intensityFor: (): IntensityLevel => 0,
      },
    });
    const cells = wrapper.findAllComponents(DayCell);
    expect(cells[29]?.attributes('title')).toMatch(/^Today — .*· Not completed$/);
    expect(cells[0]?.attributes('title')).not.toMatch(/^Today — /);
  });

  it('renders the 30-day timeline labels', () => {
    const wrapper = mount(DayGrid, {
      props: {
        days,
        intensityFor: (): IntensityLevel => 0,
      },
    });
    expect(wrapper.text()).toContain('Jul 29 (30d ago)');
    expect(wrapper.text()).toContain('Today (Aug 27)');
    expect(wrapper.find('svg[aria-hidden="true"]').exists()).toBe(true);
  });
});