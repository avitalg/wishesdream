import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useSeo } from '../hooks/useSeo.js';
import { buildFaqPageJsonLd } from '../lib/seoJsonLd.js';

export function FaqPage() {
  const { t } = useTranslation();
  const faqItems = t('content.faq.items', { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  useSeo({
    title: t('seo.faq.title'),
    description: t('seo.faq.description'),
    path: '/faq',
    jsonLd: buildFaqPageJsonLd(),
  });

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">{t('content.faq.eyebrow')}</p>
        <h1>{t('content.faq.title')}</h1>
        <p className="content-lead">{t('content.faq.lead')}</p>

        <div className="faq-list">
          {faqItems.map((item) => (
            <section key={item.question} className="faq-item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>

        <div className="content-actions">
          <Link to="/how-it-works" className="btn-outline">
            {t('nav.howItWorks')}
          </Link>
          <Link to="/register" className="btn-primary">
            {t('nav.createYourList')}
          </Link>
        </div>
      </article>
    </Layout>
  );
}
