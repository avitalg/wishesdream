import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['en', 'he'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'wishgather_lang';

const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en_US',
  he: 'he_IL',
};

export function getDirection(language: string): 'ltr' | 'rtl' {
  return language === 'he' ? 'rtl' : 'ltr';
}

export function getOgLocale(language: string): string {
  if (language === 'he') {
    return LOCALE_MAP.he;
  }
  return LOCALE_MAP.en;
}

export function getAlternateOgLocale(language: string): string {
  return language.startsWith('he') ? LOCALE_MAP.en : LOCALE_MAP.he;
}

export function applyDocumentLanguage(language: string): void {
  const lang = language.startsWith('he') ? 'he' : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = getDirection(lang);
}

function languageFromPath(): SupportedLanguage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/he/blog' || path.startsWith('/he/blog/')) {
    return 'he';
  }

  return undefined;
}

function readStoredLanguage(): SupportedLanguage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (value === 'he' || value === 'en') {
      return value;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

const initialLanguage = languageFromPath() ?? readStoredLanguage() ?? 'en';

let hebrewResources: Promise<void> | null = null;

export function ensureHebrewResources(): Promise<void> {
  if (i18n.hasResourceBundle('he', 'translation')) {
    return Promise.resolve();
  }

  hebrewResources ??= import('./locales/he.json').then((module) => {
    i18n.addResourceBundle('he', 'translation', module.default, true, true);
  });

  return hebrewResources;
}

export function suspendUntilHebrewReady(): void {
  if (!i18n.hasResourceBundle('he', 'translation')) {
    throw ensureHebrewResources();
  }
}

void i18n.use(initReactI18next).init({
  lng: initialLanguage === 'he' ? 'en' : initialLanguage,
  partialBundledLanguages: true,
  resources: {
    en: { translation: en },
  },
  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  interpolation: {
    escapeValue: false,
  },
});

function persistLanguage(language: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language.startsWith('he') ? 'he' : 'en');
  } catch {
    // Storage can be blocked; language still applies for this visit.
  }
}

i18n.on('languageChanged', (language) => {
  applyDocumentLanguage(language);
  persistLanguage(language);
});
applyDocumentLanguage(initialLanguage === 'he' ? 'he' : i18n.language);
if (initialLanguage !== 'he') {
  persistLanguage(i18n.language);
}

export const i18nReady: Promise<void> =
  initialLanguage === 'he'
    ? ensureHebrewResources().then(() => i18n.changeLanguage('he')).then(() => undefined)
    : Promise.resolve();

export default i18n;
