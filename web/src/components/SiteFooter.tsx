import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { footerNavGroups } from '../config/navigation.js';

interface SiteFooterProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function SiteFooter({ isLoggedIn, onLogout }: SiteFooterProps) {
  const { t } = useTranslation();

  const productLinks = footerNavGroups.product.map((item) =>
    item.labelKey === 'nav.createList'
      ? { ...item, to: isLoggedIn ? '/dashboard' : '/register' }
      : item,
  );

  const accountLinks = isLoggedIn ? footerNavGroups.accountHost : footerNavGroups.accountGuest;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <p className="footer-brand">{t('common.siteName')}</p>
          <p className="footer-tagline">{t('nav.footerTagline')}</p>
        </div>

        <div className="footer-menus">
          <nav className="footer-menu" aria-label={t('nav.product')}>
            <p className="footer-menu__title">{t('nav.product')}</p>
            <ul className="footer-menu__list">
              {productLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-menu__link">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-menu" aria-label={t('nav.account')}>
            <p className="footer-menu__title">{t('nav.account')}</p>
            <ul className="footer-menu__list">
              {accountLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-menu__link">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
              {isLoggedIn && (
                <li>
                  <button type="button" className="footer-menu__link footer-menu__button" onClick={onLogout}>
                    {t('nav.logOut')}
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <nav className="footer-menu" aria-label={t('nav.legal')}>
            <p className="footer-menu__title">{t('nav.legal')}</p>
            <ul className="footer-menu__list">
              {footerNavGroups.legal.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-menu__link">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <p className="footer-copy">© {new Date().getFullYear()} {t('common.siteName')}</p>
    </footer>
  );
}
