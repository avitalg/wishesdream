import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { useCreateList } from '../hooks/mutations/useCreateList.js';
import { useMyLists } from '../hooks/queries/useMyLists.js';
import { useSeo } from '../hooks/useSeo.js';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const { data: lists = [], isLoading, error } = useMyLists(Boolean(user));
  const createList = useCreateList();

  useSeo({
    title: 'Dashboard',
    path: '/dashboard',
    noindex: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    try {
      const result = await createList.mutateAsync(title.trim());
      navigate(`/lists/${result.list.public_id}/manage`);
    } catch {
      // Error surfaced via createList.error
    }
  }

  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    (createList.error instanceof Error ? createList.error.message : null);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>My Gift Lists</h1>
          <p className="form-hint">Welcome back, {user?.name}!</p>
        </div>
      </div>

      <form className="create-list-form" onSubmit={handleCreate}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sarah's Birthday Wish List"
          required
        />
        <button type="submit" className="btn-primary" disabled={createList.isPending}>
          {createList.isPending ? 'Creating…' : 'New List'}
        </button>
      </form>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {isLoading ? (
        <p className="loading-text">Loading your lists…</p>
      ) : lists.length === 0 ? (
        <p className="empty-state">No lists yet. Create your first one above!</p>
      ) : (
        <ul className="list-grid">
          {lists.map((list) => (
            <li key={list.public_id} className="list-card">
              <h3>{list.title}</h3>
              <p className="list-meta">Created {new Date(list.created_at).toLocaleDateString()}</p>
              <div className="list-card-actions">
                <Link to={`/lists/${list.public_id}/manage`} className="btn-primary btn-sm">
                  Manage
                </Link>
                <Link to={`/lists/${list.public_id}`} className="btn-outline btn-sm">
                  Guest View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
