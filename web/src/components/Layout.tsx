import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { SiteFooter } from './SiteFooter.js';
import { SiteHeader } from './SiteHeader.js';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        Soft, thoughtful gifting — keep every claim private
      </div>

      <SiteHeader isLoggedIn={Boolean(user)} onLogout={handleLogout} />

      <main className="site-main">{children}</main>

      <SiteFooter isLoggedIn={Boolean(user)} onLogout={handleLogout} />
    </div>
  );
}
