import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { useSeo } from '../hooks/useSeo.js';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: 'Host Login',
    description: 'Sign in to manage your WishesDream gift registry.',
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
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <Layout>
      <div className="auth-card">
        <h1>Host Login</h1>
        <p className="form-hint">Sign in to manage your gift lists.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
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
            {isLoading ? 'Signing in…' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </Layout>
  );
}
