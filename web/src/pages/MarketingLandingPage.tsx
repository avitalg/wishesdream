import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useSeo } from '../hooks/useSeo.js';
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLdFromItems,
  buildJsonLdGraph,
} from '../lib/seoJsonLd.js';

export type LandingContentKey =
  | 'giftRegistry'
  | 'babyShowerRegistry'
  | 'birthdayWishList'
  | 'giftList'
  | 'compare';

interface MarketingLandingPageProps {
  landingKey: LandingContentKey;
  path: string;
}

interface LandingSection {
  title: string;
  body: string;
}

interface LandingFaq {
  question: string;
  answer: string;
}

interface RelatedLink {
  labelKey: string;
  to: string;
}

export function MarketingLandingPage({ landingKey, path }: MarketingLandingPageProps) {
  const { t } = useTranslation();
  const prefix = `content.landing.${landingKey}`;

  const sections = t(`${prefix}.sections`, { returnObjects: true }) as LandingSection[];
  const faqs = t(`${prefix}.faqs`, { returnObjects: true }) as LandingFaq[];
  const related = t(`${prefix}.related`, { returnObjects: true }) as RelatedLink[];

  const seoTitle = t(`seo.${landingKey}.title`);
  const seoDescription = t(`seo.${landingKey}.description`);
  const articleHeadline = t(`${prefix}.title`);
  const isArticle = landingKey === 'giftList';

  useSeo({
    title: seoTitle,
    description: seoDescription,
    path,
    type: isArticle ? 'article' : 'website',
    jsonLd: buildJsonLdGraph([
      buildBreadcrumbJsonLd([
        { name: t('nav.home'), path: '/' },
        { name: seoTitle, path },
      ]),
      ...(isArticle
        ? [
            buildArticleJsonLd({
              headline: articleHeadline,
              description: seoDescription,
              path,
            }),
          ]
        : []),
      buildFaqPageJsonLdFromItems(faqs),
    ]),
  });

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">{t(`${prefix}.eyebrow`)}</p>
        <h1>{t(`${prefix}.title`)}</h1>
        <p className="content-lead">{t(`${prefix}.lead`)}</p>

        {sections.map((section) => (
          <section key={section.title} className="content-section">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        <div className="faq-list">
          {faqs.map((item) => (
            <section key={item.question} className="faq-item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>

        <nav className="content-related" aria-label={t(`${prefix}.relatedTitle`)}>
          <p className="content-related__title">{t(`${prefix}.relatedTitle`)}</p>
          <ul className="content-related__list">
            {related.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>

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
