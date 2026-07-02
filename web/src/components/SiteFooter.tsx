import { Link } from 'react-router-dom';
import { footerNavGroups } from '../config/navigation.js';

interface SiteFooterProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function SiteFooter({ isLoggedIn, onLogout }: SiteFooterProps) {
  const productLinks = footerNavGroups.product.map((item) =>
    item.label === 'Create a List'
      ? { ...item, to: isLoggedIn ? '/dashboard' : '/register' }
      : item,
  );

  const accountLinks = isLoggedIn ? footerNavGroups.accountHost : footerNavGroups.accountGuest;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <p className="footer-brand">WishesDream</p>
          <p className="footer-tagline">Celebrate with grace. Gift with privacy.</p>
        </div>

        <div className="footer-menus">
          <nav className="footer-menu" aria-label="Product">
            <p className="footer-menu__title">Product</p>
            <ul className="footer-menu__list">
              {productLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-menu__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-menu" aria-label="Account">
            <p className="footer-menu__title">Account</p>
            <ul className="footer-menu__list">
              {accountLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-menu__link">
                    {item.label}
                  </Link>
                </li>
              ))}
              {isLoggedIn && (
                <li>
                  <button type="button" className="footer-menu__link footer-menu__button" onClick={onLogout}>
                    Log Out
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <nav className="footer-menu" aria-label="Legal">
            <p className="footer-menu__title">Legal</p>
            <ul className="footer-menu__list">
              {footerNavGroups.legal.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-menu__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <p className="footer-copy">© {new Date().getFullYear()} WishesDream</p>
    </footer>
  );
}
