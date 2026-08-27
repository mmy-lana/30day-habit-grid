import { describe, expect, it } from 'vitest';
import { readBackupFile, validateBackupSchema } from '@/utils/backup';
import type { HabitStoreState } from '@/types/store';

const validState: HabitStoreState = {
  habits: [
    {
      id: 'h1',
      name: 'Read',
      category: 'learning',
      createdAt: '2026-08-01T00:00:00.000Z',
      emoji: '📚',
    },
  ],
  completions: { h1: { '2026-08-26': true } },
  theme: 'dark',
};

describe('validateBackupSchema', () => {
  it('accepts a valid full state', () => {
    expect(validateBackupSchema(validState)).toBe(true);
  });

  it('accepts a valid empty state', () => {
    expect(
      validateBackupSchema({ habits: [], completions: {}, theme: 'dark' }),
    ).toBe(true);
  });

  it('accepts a valid state without the optional emoji', () => {
    const habit = { ...validState.habits[0], emoji: undefined };
    expect(validateBackupSchema({ ...validState, habits: [habit] })).toBe(true);
  });

  it('rejects an invalid category', () => {
    const habit = { ...validState.habits[0], category: 'sports' };
    expect(validateBackupSchema({ ...validState, habits: [habit] })).toBe(false);
  });

  it('rejects a habit missing its id', () => {
    const habit = {
      name: 'Read',
      category: 'learning',
      createdAt: '2026-08-01T00:00:00.000Z',
    };
    expect(validateBackupSchema({ ...validState, habits: [habit] })).toBe(false);
  });

  it('rejects a habit with an empty name', () => {
    const habit = { ...validState.habits[0], name: '' };
    expect(validateBackupSchema({ ...validState, habits: [habit] })).toBe(false);
  });

  it('rejects a habit name longer than 40 characters', () => {
    const habit = { ...validState.habits[0], name: 'a'.repeat(41) };
    expect(validateBackupSchema({ ...validState, habits: [habit] })).toBe(false);
  });

  it('rejects a habit missing createdAt', () => {
    const habit = {
      id: 'h1',
      name: 'Read',
      category: 'learning',
    };
    expect(validateBackupSchema({ ...validState, habits: [habit] })).toBe(false);
  });

  it('rejects a non-string emoji', () => {
    const habit = { ...validState.habits[0], emoji: 5 };
    expect(validateBackupSchema({ ...validState, habits: [habit] })).toBe(false);
  });

  it('rejects habits that are not an array', () => {
    expect(validateBackupSchema({ ...validState, habits: {} })).toBe(false);
  });

  it('rejects completions that are not an object', () => {
    expect(validateBackupSchema({ ...validState, completions: [] })).toBe(false);
  });

  it('rejects a non-boolean completion leaf', () => {
    expect(
      validateBackupSchema({
        ...validState,
        completions: { h1: { '2026-08-26': 'yes' } },
      }),
    ).toBe(false);
  });

  it('rejects an invalid theme', () => {
    expect(validateBackupSchema({ ...validState, theme: 'blue' })).toBe(false);
  });

  it.each([
    ['null', null],
    ['an array', []],
    ['a string', 'string'],
    ['a number', 42],
    ['undefined', undefined],
  ])('rejects non-object top-level data: %s', (_label, value) => {
    expect(validateBackupSchema(value)).toBe(false);
  });
});

describe('readBackupFile', () => {
  it('resolves the parsed state for a valid JSON file', async () => {
    const file = new File([JSON.stringify(validState)], 'backup.json', {
      type: 'application/json',
    });
    await expect(readBackupFile(file)).resolves.toEqual(validState);
  });

  it('rejects malformed JSON', async () => {
    const file = new File(['{"habits":'], 'backup.json', {
      type: 'application/json',
    });
    await expect(readBackupFile(file)).rejects.toThrow(/not valid JSON/);
  });

  it('rejects valid JSON that fails schema validation', async () => {
    const file = new File([JSON.stringify({ habits: 'nope' })], 'backup.json', {
      type: 'application/json',
    });
    await expect(readBackupFile(file)).rejects.toThrow(/schema/);
  });

  it('rejects an empty file', async () => {
    const file = new File([''], 'backup.json', { type: 'application/json' });
    await expect(readBackupFile(file)).rejects.toThrow(/JSON/);
  });
});