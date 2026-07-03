// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher.js';
import i18n from '../i18n/index.js';

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('switches document direction to rtl for Hebrew', async () => {
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'עב' }));

    expect(document.documentElement.lang).toBe('he');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('switches document direction back to ltr for English', async () => {
    await i18n.changeLanguage('he');
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
