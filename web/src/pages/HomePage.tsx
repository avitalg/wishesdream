import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { useSeo } from '../hooks/useSeo.js';
import {
  buildOrganizationJsonLd,
  buildWebApplicationJsonLd,
  buildWebSiteJsonLd,
} from '../lib/seoJsonLd.js';
import screenshot from '../assets/Screenshot1.png';
import dollImage from '../assets/doll.jpg';

export function HomePage() {
  const { user } = useAuth();

  useSeo({
    path: '/',
    jsonLd: [buildOrganizationJsonLd(), buildWebSiteJsonLd(), buildWebApplicationJsonLd()],
  });

  return (
    <Layout>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Gift Registry for Every Celebration</p>
          <h1>Curated gifts.<br />Private claims.</h1>
          <p className="hero-text">
            Build a beautiful wish list for birthdays, baby showers, weddings, and more.
            Guests see what&apos;s available — never who claimed what — while you stay
            informed for every thank-you note.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              Create Your List
            </Link>
            <Link to="/login" className="btn-outline">
              Host Login
            </Link>
          </div>
        </div>
        {!user ? (
          <div className="hero-visual">
            <img
              src={screenshot}
              alt="WishesDream gift list showing add gift form and product cards"
              className="hero-screenshot"
            />
          </div>
        ) : (
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orb hero-orb--1" />
            <div className="hero-orb hero-orb--2" />
            <div className="hero-card-preview">
              <div className="hero-card-preview__image">
                <img
                  src={dollImage}
                  alt=""
                  width={600}
                  height={327}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="hero-card-preview__body">
                <span className="status-badge available">Available</span>
                <p className="hero-card-preview__title">Cherished Ballerina Doll</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="features" id="features">
        <div className="section-intro">
          <p className="eyebrow">Why WishesDream</p>
          <h2>Designed for modern celebrations</h2>
        </div>
        <div className="features-grid">
          <article className="feature-card">
            <span className="feature-icon">🤍</span>
            <h3>Privacy-first</h3>
            <p>Guests only see Available or Already Selected — never each other&apos;s names.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">🔗</span>
            <h3>Smart import</h3>
            <p>Paste any product link and we fetch the title, image, and price for you.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">✨</span>
            <h3>Live updates</h3>
            <p>When someone claims a gift, every guest&apos;s screen updates instantly.</p>
          </article>
        </div>
      </section>
    </Layout>
  );
}
