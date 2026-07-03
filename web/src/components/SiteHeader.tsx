import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mainNavItems } from '../config/navigation.js';
import { LanguageSwitcher } from './LanguageSwitcher.js';

function navLinkClass(isActive: boolean): string {
  return isActive ? 'nav-link nav-link--active' : 'nav-link';
}

interface SiteHeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function SiteHeader({ isLoggedIn, onLogout }: SiteHeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    onLogout();
  }

  return (
    <header className={`site-header${menuOpen ? ' site-header--menu-open' : ''}`}>
      <Link to="/" className="brand" onClick={closeMenu}>
        <span className="brand-mark" aria-hidden="true">✦</span>
        {t('common.siteName')}
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="nav-toggle__bar" aria-hidden="true" />
        <span className="nav-toggle__bar" aria-hidden="true" />
        <span className="nav-toggle__bar" aria-hidden="true" />
      </button>

      <nav id="site-nav" className={`site-nav${menuOpen ? ' site-nav--open' : ''}`} aria-label="Main">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => navLinkClass(isActive)}
            onClick={closeMenu}
          >
            {t(item.labelKey)}
          </NavLink>
        ))}

        <div className="site-nav__language">
          <LanguageSwitcher />
        </div>

        {isLoggedIn ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => navLinkClass(isActive)}
              onClick={closeMenu}
            >
              {t('nav.myLists')}
            </NavLink>
            <button type="button" className="nav-link nav-button" onClick={handleLogout}>
              {t('nav.logOut')}
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => navLinkClass(isActive)}
              onClick={closeMenu}
            >
              {t('nav.logIn')}
            </NavLink>
            <Link to="/register" className="btn-primary btn-sm site-nav__cta" onClick={closeMenu}>
              {t('nav.signUp')}
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
