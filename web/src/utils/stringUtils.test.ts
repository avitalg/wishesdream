import { describe, expect, it } from 'vitest';
import { formatShortDate, slugify } from './stringUtils.js';

describe('stringUtils', () => {
  it('slugifies list titles for filenames', () => {
    expect(slugify('My Baby Shower!')).toBe('my-baby-shower');
    expect(slugify('  Hello World  ')).toBe('-hello-world-');
  });

  it('formats valid dates and preserves invalid values', () => {
    expect(formatShortDate(null)).toBe('—');
    expect(formatShortDate('not-a-date')).toBe('not-a-date');
    expect(formatShortDate('2026-01-15T12:00:00.000Z')).toMatch(/2026/);
  });
});
