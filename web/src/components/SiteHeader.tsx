import { Link, NavLink } from 'react-router-dom';
import { mainNavItems } from '../config/navigation.js';

function navLinkClass(isActive: boolean): string {
  return isActive ? 'nav-link nav-link--active' : 'nav-link';
}

interface SiteHeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function SiteHeader({ isLoggedIn, onLogout }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark" aria-hidden="true">✦</span>
        WishesDream
      </Link>

      <nav className="site-nav" aria-label="Main">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            {item.label}
          </NavLink>
        ))}

        {isLoggedIn ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
              My Lists
            </NavLink>
            <button type="button" className="nav-link nav-button" onClick={onLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => navLinkClass(isActive)}>
              Log In
            </NavLink>
            <Link to="/register" className="btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
