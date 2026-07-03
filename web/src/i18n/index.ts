import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import he from './locales/he.json';

export const SUPPORTED_LANGUAGES = ['en', 'he'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'wishesdream_lang';

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

export function applyDocumentLanguage(language: string): void {
  const lang = language.startsWith('he') ? 'he' : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = getDirection(lang);
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
  });

i18n.on('languageChanged', applyDocumentLanguage);
applyDocumentLanguage(i18n.language);

export default i18n;
