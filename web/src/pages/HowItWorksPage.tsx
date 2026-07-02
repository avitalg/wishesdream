import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';

export function HowItWorksPage() {
  const { user } = useAuth();

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">How It Works</p>
        <h1>Simple for hosts. Private for guests.</h1>
        <p className="content-lead">
          WishesDream helps you build a baby shower registry from any store, share one link with
          guests, and keep claim details private until you need them.
        </p>

        <section className="content-section">
          <h2>For hosts</h2>
          <ol className="content-steps">
            <li>Create a free account and start a new gift list.</li>
            <li>Paste product links — we fetch the title, image, and price automatically.</li>
            <li>Share your list link with guests. You see who claimed what; they don&apos;t.</li>
            <li>Export a PDF after the shower for thank-you notes.</li>
          </ol>
        </section>

        <section className="content-section">
          <h2>For guests</h2>
          <ol className="content-steps">
            <li>Open the shared list link — no account needed.</li>
            <li>Browse available gifts and pick one to claim.</li>
            <li>Enter your name. Other guests only see &ldquo;Already Selected.&rdquo;</li>
            <li>Changed your mind? Unclaim your gift from the same browser session.</li>
          </ol>
        </section>

        <section className="content-section">
          <h2>Privacy by design</h2>
          <p>
            Guests never see each other&apos;s names. Hosts get full visibility for coordination and
            thank-yous. Live updates keep everyone on the same page without refreshing.
          </p>
        </section>

        <div className="content-actions">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to My Lists
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">
                Create Your List
              </Link>
              <Link to="/login" className="btn-outline">
                Host Login
              </Link>
            </>
          )}
        </div>
      </article>
    </Layout>
  );
}
