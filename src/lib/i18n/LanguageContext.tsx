import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { LanguageCode, TranslationKey } from './keys';
import { DEFAULT_LANGUAGE, LANGUAGES } from './keys';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { tr } from './tr';
import { ku } from './ku';
import { ar } from './ar';
import { fa } from './fa';

const DICTIONARIES: Record<LanguageCode, Record<TranslationKey, string>> = { en, de, fr, tr, ku, ar, fa };

function dirFor(lang: LanguageCode): 'ltr' | 'rtl' {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr';
}

const STORAGE_KEY = 'expense-dashboard-language-v1';

type TranslateFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

interface LanguageContextValue {
  language: LanguageCode;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: LanguageCode) => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Looks at the browser/OS language preferences (e.g. "tr-TR", "ar-EG") and
 * returns the first one that matches one of our supported languages, using
 * just the primary subtag ("tr" out of "tr-TR"). Returns null if nothing
 * the browser reports matches — the caller falls back to English.
 */
function detectBrowserLanguage(): LanguageCode | null {
  if (typeof navigator === 'undefined') return null;

  const candidates =
    navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];

  for (const raw of candidates) {
    if (!raw) continue;
    const primary = raw.toLowerCase().split('-')[0];
    if (primary in DICTIONARIES) return primary as LanguageCode;
  }
  return null;
}

function loadLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in DICTIONARIES) return stored as LanguageCode;
  } catch {
    // ignore
  }
  // No explicit choice saved yet (first visit) — try the browser's own
  // language before falling back to English.
  return detectBrowserLanguage() ?? DEFAULT_LANGUAGE;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key];
    return value !== undefined ? String(value) : match;
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(loadLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // localStorage unavailable — selection won't persist, app still works.
    }
    document.documentElement.dir = dirFor(language);
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(lang: LanguageCode) {
    setLanguageState(lang);
  }

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const dictionary = DICTIONARIES[language] ?? DICTIONARIES[DEFAULT_LANGUAGE];
    const template = dictionary[key] ?? DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key;
    return interpolate(template, vars);
  }

  return (
    <LanguageContext.Provider value={{ language, dir: dirFor(language), setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}
