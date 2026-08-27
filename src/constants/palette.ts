import type { HabitCategory, IntensityLevel } from '@/types/habit';

/** GitHub light palette — mirrors the CSS custom properties in assets/main.css. */
export const LIGHT_LEVELS: Record<IntensityLevel, string> = {
  0: '#ebedf0',
  1: '#9be9a8',
  2: '#40c463',
  3: '#30a14e',
  4: '#216e39',
};

/** GitHub dark palette — mirrors the CSS custom properties in assets/main.css. */
export const DARK_LEVELS: Record<IntensityLevel, string> = {
  0: '#161b22',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

/** Prefix for the CSS custom property that paints a cell, e.g. `--gh-level-4`. */
export const LEVEL_CSS_VAR_PREFIX = '--gh-level-';

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  health: '#0969da', // blue
  learning: '#8250df', // purple
  fitness: '#db6d28', // orange
  mindfulness: '#1b7c83', // teal
  creativity: '#bf4b8a', // magenta
  social: '#d4a72c', // amber
};