import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useSeo } from '../hooks/useSeo.js';

export function NotFoundPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useSeo({
    title: t('seo.notFound.title'),
    description: t('seo.notFound.description'),
    path: pathname,
    noindex: true,
  });

  return (
    <Layout>
      <section className="content-page not-found-page">
        <p className="eyebrow">404</p>
        <h1>{t('notFound.title')}</h1>
        <p className="content-lead">{t('notFound.description')}</p>
        <Link to="/" className="btn-primary">
          {t('notFound.backHome')}
        </Link>
      </section>
    </Layout>
  );
}
