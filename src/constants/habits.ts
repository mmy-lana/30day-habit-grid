import type { HabitStoreState } from '@/types/store';

export const CATEGORIES = [
  { value: 'health', label: 'Health' },
  { value: 'learning', label: 'Learning' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'social', label: 'Social' },
] as const;

export const EMOJI_PRESETS = ['💧', '📚', '🏃', '🧘', '🎨', '🤝', '🎯', '🥗', '😴', '🧠', '💪', '✍️'];

export const DEFAULT_HABITS_SEED: HabitStoreState = {
  habits: [],
  completions: {},
  theme: 'dark',
};