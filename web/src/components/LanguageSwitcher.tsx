import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isBlogPath, localizedBlogPath, toEnglishBlogPath } from '../content/blog.js';
import i18n, { type SupportedLanguage } from '../i18n/index.js';

export function LanguageSwitcher() {
  const { t, i18n: i18nInstance } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const current = (i18nInstance.language.startsWith('he') ? 'he' : 'en') as SupportedLanguage;

  function switchTo(language: SupportedLanguage) {
    void i18n.changeLanguage(language);
    if (!isBlogPath(location.pathname)) {
      return;
    }

    const target = localizedBlogPath(toEnglishBlogPath(location.pathname), language);
    if (target !== location.pathname) {
      navigate(target);
    }
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
