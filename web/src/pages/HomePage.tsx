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

      {!user && (
        <section className="guest-claim" id="for-guests">
          <div className="guest-claim__inner">
            <div className="guest-claim__intro">
              <p className="eyebrow">For Guests</p>
              <h2>Claim a gift in seconds</h2>
              <p className="guest-claim__lead">
                No account, no app download. Open the list link your host shared, pick an available
                gift, and enter your name — that&apos;s it.
              </p>
              <div className="guest-claim__preview" aria-hidden="true">
                <article className="guest-claim__card item-card">
                  <div className="item-image-wrap">
                    <img
                      src={dollImage}
                      alt=""
                      className="item-image"
                      width={600}
                      height={327}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="item-image-badge">
                      <span className="status-badge available">Available</span>
                    </div>
                  </div>
                  <div className="item-body">
                    <p className="item-number">Gift 1</p>
                    <h3 className="item-title">Cherished Ballerina Doll</h3>
                    <div className="item-actions">
                      <span className="item-view-link">View product →</span>
                      <div className="item-action-buttons">
                        <span className="btn-primary btn-sm">Claim Gift</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
              <Link to="/how-it-works" className="btn-outline">
                See Full Guide
              </Link>
            </div>

            <ol className="guest-claim__steps">
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">1</span>
                <div>
                  <h3>Open the shared link</h3>
                  <p>Tap the list URL from a text, email, or invitation. No sign-up required.</p>
                </div>
              </li>
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">2</span>
                <div>
                  <h3>Choose an available gift</h3>
                  <p>
                    Browse the registry and hit <strong>Claim Gift</strong> on something you&apos;d
                    like to give.
                  </p>
                </div>
              </li>
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">3</span>
                <div>
                  <h3>Enter your name</h3>
                  <p>
                    Your name is private — other guests only see &ldquo;Already Selected,&rdquo; not
                    who claimed it.
                  </p>
                </div>
              </li>
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">4</span>
                <div>
                  <h3>Changed your mind?</h3>
                  <p>
                    Unclaim anytime from the same browser. The gift opens back up for everyone
                    instantly.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
      )}

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
