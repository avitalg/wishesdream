import { useTranslation } from 'react-i18next';
import i18n, { type SupportedLanguage } from '../i18n/index.js';

export function LanguageSwitcher() {
  const { t, i18n: i18nInstance } = useTranslation();
  const current = (i18nInstance.language.startsWith('he') ? 'he' : 'en') as SupportedLanguage;

  function switchTo(language: SupportedLanguage) {
    void i18n.changeLanguage(language);
  }

  return (
    <div className="language-switcher" role="group" aria-label={t('nav.languageSwitch')}>
      <button
        type="button"
        className={`language-switcher__btn ${current === 'en' ? 'language-switcher__btn--active' : ''}`}
        onClick={() => switchTo('en')}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
      <span className="language-switcher__divider" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        className={`language-switcher__btn ${current === 'he' ? 'language-switcher__btn--active' : ''}`}
        onClick={() => switchTo('he')}
        aria-pressed={current === 'he'}
      >
        עב
      </button>
    </div>
  );
}
