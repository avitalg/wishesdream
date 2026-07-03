import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useSeo } from '../hooks/useSeo.js';

export function CookiePolicyPage() {
  const { t } = useTranslation();

  useSeo({
    title: t('seo.cookies.title'),
    description: t('seo.cookies.description'),
    path: '/cookies',
  });

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">{t('content.cookies.eyebrow')}</p>
        <h1>{t('content.cookies.title')}</h1>
        <p className="content-lead">{t('content.cookies.lead')}</p>

        <section className="content-section">
          <h2>{t('content.cookies.whatTitle')}</h2>
          <p>{t('content.cookies.whatText')}</p>
        </section>

        <section className="content-section">
          <h2>{t('content.cookies.storageTitle')}</h2>
          <ul className="content-list">
            <li>{t('content.cookies.storageHost')}</li>
            <li>{t('content.cookies.storageGuest')}</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>{t('content.cookies.notUsedTitle')}</h2>
          <p>{t('content.cookies.notUsedText')}</p>
        </section>

        <section className="content-section">
          <h2>{t('content.cookies.thirdPartyTitle')}</h2>
          <p>{t('content.cookies.thirdPartyText')}</p>
        </section>

        <section className="content-section">
          <h2>{t('content.cookies.managingTitle')}</h2>
          <p>{t('content.cookies.managingText')}</p>
        </section>

        <section className="content-section">
          <h2>{t('content.cookies.moreTitle')}</h2>
          <p>
            <Trans
              i18nKey="content.cookies.moreText"
              components={{ privacyLink: <Link to="/privacy" /> }}
            />
          </p>
        </section>
      </article>
    </Layout>
  );
}
