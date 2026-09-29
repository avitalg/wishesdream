// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher.js';
import i18n, { ensureHebrewResources } from '../i18n/index.js';

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
}

function renderSwitcher(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageSwitcher />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('switches document direction to rtl for Hebrew', async () => {
    renderSwitcher();

    fireEvent.click(screen.getByRole('button', { name: 'עב' }));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('he');
      expect(document.documentElement.dir).toBe('rtl');
    });
    expect(screen.getByTestId('path').textContent).toBe('/');
  });

  it('switches document direction back to ltr for English', async () => {
    await ensureHebrewResources();
    await i18n.changeLanguage('he');
    renderSwitcher();

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  it('moves between the English and Hebrew article urls', async () => {
    renderSwitcher('/blog/gift-list');

    fireEvent.click(screen.getByRole('button', { name: 'עב' }));

    await waitFor(() => {
      expect(screen.getByTestId('path').textContent).toBe('/he/blog/gift-list');
    });

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    await waitFor(() => {
      expect(screen.getByTestId('path').textContent).toBe('/blog/gift-list');
      expect(document.documentElement.lang).toBe('en');
    });
  });
});
