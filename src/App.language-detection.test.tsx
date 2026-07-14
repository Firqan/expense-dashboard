import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { resetTransactionsDbForTests } from './lib/transactionsDb';

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'language', {
    value: languages[0],
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'languages', {
    value: languages,
    configurable: true,
  });
}

const ORIGINAL_LANGUAGE = window.navigator.language;
const ORIGINAL_LANGUAGES = window.navigator.languages;

describe('App — browser language auto-detection', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetTransactionsDbForTests();
    document.documentElement.dir = 'ltr';
  });

  afterEach(() => {
    setBrowserLanguages([ORIGINAL_LANGUAGE, ...ORIGINAL_LANGUAGES]);
  });

  it('opens in Turkish when the browser is set to Turkish and no preference is saved', () => {
    setBrowserLanguages(['tr-TR', 'en-US']);
    render(<App />);
    expect(screen.getByText('Gider Kontrol Paneli')).toBeInTheDocument();
  });

  it('opens in Arabic (and switches to RTL) when the browser is set to Arabic', () => {
    setBrowserLanguages(['ar-SA']);
    render(<App />);
    expect(screen.getByText('لوحة النفقات')).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('falls back to English when the browser language is not one of the supported 7', () => {
    setBrowserLanguages(['ja-JP', 'ko-KR']);
    render(<App />);
    expect(screen.getByText('Expense Dashboard')).toBeInTheDocument();
  });

  it('picks the first supported language when the primary browser language is unsupported', () => {
    setBrowserLanguages(['ja-JP', 'fr-FR', 'en-US']);
    render(<App />);
    expect(screen.getByText('Tableau de bord des dépenses')).toBeInTheDocument();
  });

  it('matches on the primary subtag regardless of region (de-CH still matches German)', () => {
    setBrowserLanguages(['de-CH']);
    render(<App />);
    expect(screen.getByText('Ausgaben-Dashboard')).toBeInTheDocument();
  });

  it('respects a previously saved language choice over the current browser language', () => {
    localStorage.setItem('expense-dashboard-language-v1', 'de');
    setBrowserLanguages(['tr-TR']);
    render(<App />);
    expect(screen.getByText('Ausgaben-Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Gider Kontrol Paneli')).not.toBeInTheDocument();
  });
});
