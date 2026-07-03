import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { useSeo } from '../hooks/useSeo.js';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: t('seo.login.title'),
    description: t('seo.login.description'),
    path: '/login',
    noindex: true,
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.loginFailed'));
    }
  }

  return (
    <Layout>
      <div className="auth-card">
        <h1>{t('auth.hostLogin')}</h1>
        <p className="form-hint">{t('auth.hostLoginHint')}</p>

        <form onSubmit={handleSubmit}>
          <label>
            {t('common.email')}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            {t('common.password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
            {isLoading ? t('common.signingIn') : t('auth.logIn')}
          </button>
        </form>

        <p className="auth-footer">
          {t('auth.newHere')} <Link to="/register">{t('auth.createAccount')}</Link>
        </p>
      </div>
    </Layout>
  );
}
