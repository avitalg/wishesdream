import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { useSeo } from '../hooks/useSeo.js';

export function HowItWorksPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  useSeo({
    title: t('seo.howItWorks.title'),
    description: t('seo.howItWorks.description'),
    path: '/how-it-works',
  });

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">{t('content.howItWorks.eyebrow')}</p>
        <h1>{t('content.howItWorks.title')}</h1>
        <p className="content-lead">{t('content.howItWorks.lead')}</p>

        <section className="content-section">
          <h2>{t('content.howItWorks.hostsTitle')}</h2>
          <ol className="content-steps">
            <li>{t('content.howItWorks.hostsStep1')}</li>
            <li>{t('content.howItWorks.hostsStep2')}</li>
            <li>{t('content.howItWorks.hostsStep3')}</li>
            <li>{t('content.howItWorks.hostsStep4')}</li>
          </ol>
        </section>

        <section className="content-section">
          <h2>{t('content.howItWorks.guestsTitle')}</h2>
          <ol className="content-steps">
            <li>{t('content.howItWorks.guestsStep1')}</li>
            <li>{t('content.howItWorks.guestsStep2')}</li>
            <li>{t('content.howItWorks.guestsStep3')}</li>
            <li>{t('content.howItWorks.guestsStep4')}</li>
          </ol>
        </section>

        <section className="content-section">
          <h2>{t('content.howItWorks.privacyTitle')}</h2>
          <p>{t('content.howItWorks.privacyText')}</p>
        </section>

        <div className="content-actions">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              {t('nav.goToMyLists')}
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary">
                {t('nav.createYourList')}
              </Link>
              <Link to="/login" className="btn-outline">
                {t('nav.hostLogin')}
              </Link>
            </>
          )}
        </div>
      </article>
    </Layout>
  );
}
