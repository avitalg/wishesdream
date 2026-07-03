import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { useSeo } from '../hooks/useSeo.js';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: t('seo.register.title'),
    description: t('seo.register.description'),
    path: '/register',
    noindex: true,
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await register(email, name, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.registrationFailed'));
    }
  }

  return (
    <Layout>
      <div className="auth-card">
        <h1>{t('auth.createHostAccount')}</h1>
        <p className="form-hint">{t('auth.registerHint')}</p>

        <form onSubmit={handleSubmit}>
          <label>
            {t('common.yourName')}
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
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
            {isLoading ? t('common.creatingAccount') : t('auth.signUp')}
          </button>
        </form>

        <p className="auth-footer">
          {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.logInLink')}</Link>
        </p>
      </div>
    </Layout>
  );
}
