import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  useSeo({
    description: t('seo.home.description'),
    path: '/',
    jsonLd: [buildOrganizationJsonLd(), buildWebSiteJsonLd(), buildWebApplicationJsonLd()],
  });

  return (
    <Layout>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1>
            <Trans i18nKey="home.title" components={{ br: <br /> }} />
          </h1>
          <p className="hero-text">{t('home.heroText')}</p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              {t('nav.createYourList')}
            </Link>
            <Link to="/login" className="btn-outline">
              {t('nav.hostLogin')}
            </Link>
          </div>
        </div>
        {!user ? (
          <div className="hero-visual">
            <img
              src={screenshot}
              alt={t('home.screenshotAlt')}
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
                <span className="status-badge available">{t('common.available')}</span>
                <p className="hero-card-preview__title">{t('home.previewTitle')}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {!user && (
        <section className="guest-claim" id="for-guests">
          <div className="guest-claim__inner">
            <div className="guest-claim__intro">
              <p className="eyebrow">{t('home.guestEyebrow')}</p>
              <h2>{t('home.guestTitle')}</h2>
              <p className="guest-claim__lead">{t('home.guestLead')}</p>
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
                      <span className="status-badge available">{t('common.available')}</span>
                    </div>
                  </div>
                  <div className="item-body">
                    <p className="item-number">{t('common.giftNumber', { number: 1 })}</p>
                    <h3 className="item-title">{t('home.previewTitle')}</h3>
                    <div className="item-actions">
                      <span className="item-view-link">{t('common.viewProduct')}</span>
                      <div className="item-action-buttons">
                        <span className="btn-primary btn-sm">{t('common.claimGift')}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
              <Link to="/how-it-works" className="btn-outline">
                {t('nav.seeFullGuide')}
              </Link>
            </div>

            <ol className="guest-claim__steps">
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">1</span>
                <div>
                  <h3>{t('home.step1Title')}</h3>
                  <p>{t('home.step1Text')}</p>
                </div>
              </li>
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">2</span>
                <div>
                  <h3>{t('home.step2Title')}</h3>
                  <p>
                    <Trans i18nKey="home.step2Text" components={{ strong: <strong /> }} />
                  </p>
                </div>
              </li>
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">3</span>
                <div>
                  <h3>{t('home.step3Title')}</h3>
                  <p>{t('home.step3Text')}</p>
                </div>
              </li>
              <li className="guest-claim__step">
                <span className="guest-claim__step-number">4</span>
                <div>
                  <h3>{t('home.step4Title')}</h3>
                  <p>{t('home.step4Text')}</p>
                </div>
              </li>
            </ol>
          </div>
        </section>
      )}

      <section className="features" id="features">
        <div className="section-intro">
          <p className="eyebrow">{t('home.featuresEyebrow')}</p>
          <h2>{t('home.featuresTitle')}</h2>
        </div>
        <div className="features-grid">
          <article className="feature-card">
            <span className="feature-icon">🤍</span>
            <h3>{t('home.privacyTitle')}</h3>
            <p>{t('home.privacyText')}</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">🔗</span>
            <h3>{t('home.importTitle')}</h3>
            <p>{t('home.importText')}</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">✨</span>
            <h3>{t('home.liveTitle')}</h3>
            <p>{t('home.liveText')}</p>
          </article>
        </div>
      </section>
    </Layout>
  );
}
