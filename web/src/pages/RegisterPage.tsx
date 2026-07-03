import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { useSeo } from '../hooks/useSeo.js';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: 'Create Account',
    description: 'Create a free WishesDream account and start your gift registry.',
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
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <Layout>
      <div className="auth-card">
        <h1>Create Host Account</h1>
        <p className="form-hint">Start building your gift list for any celebration.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Your Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
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
            {isLoading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </Layout>
  );
}
