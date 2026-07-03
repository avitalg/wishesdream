import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useSeo } from '../hooks/useSeo.js';

export function PrivacyPage() {
  const { t } = useTranslation();

  useSeo({
    title: t('seo.privacy.title'),
    description: t('seo.privacy.description'),
    path: '/privacy',
  });

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">{t('content.privacy.eyebrow')}</p>
        <h1>{t('content.privacy.title')}</h1>
        <p className="content-lead">{t('content.privacy.lead')}</p>

        <section className="content-section">
          <h2>{t('content.privacy.collectTitle')}</h2>
          <ul className="content-list">
            <li>{t('content.privacy.collectHosts')}</li>
            <li>{t('content.privacy.collectGuests')}</li>
            <li>{t('content.privacy.collectLists')}</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>{t('content.privacy.visibilityTitle')}</h2>
          <p>{t('content.privacy.visibilityText')}</p>
        </section>

        <section className="content-section">
          <h2>{t('content.privacy.linksTitle')}</h2>
          <p>{t('content.privacy.linksText')}</p>
        </section>

        <section className="content-section">
          <h2>{t('content.privacy.retentionTitle')}</h2>
          <p>{t('content.privacy.retentionText')}</p>
        </section>

        <section className="content-section">
          <h2>{t('content.privacy.questionsTitle')}</h2>
          <p>
            <Trans
              i18nKey="content.privacy.questionsText"
              components={{ cookieLink: <Link to="/cookies" /> }}
            />
          </p>
        </section>
      </article>
    </Layout>
  );
}
