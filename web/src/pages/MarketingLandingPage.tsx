import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizeHref, type BlogLocale } from '../content/blog.js';
import { Layout } from '../components/Layout.js';
import { useSeo, type SeoAlternate } from '../hooks/useSeo.js';
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
  | 'giftWishlist'
  | 'compare';

const ARTICLE_LANDING_KEYS = new Set<LandingContentKey>(['giftList', 'giftWishlist']);

interface MarketingSection {
  labelKey: string;
  path: string;
}

interface MarketingLandingPageProps {
  landingKey: LandingContentKey;
  path: string;
  locale?: BlogLocale;
  alternates?: SeoAlternate[];
  section?: MarketingSection;
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

export function MarketingLandingPage({
  landingKey,
  path,
  locale = 'en',
  alternates,
  section,
}: MarketingLandingPageProps) {
  const { t: translate, i18n } = useTranslation();
  const t = locale === 'he' ? i18n.getFixedT('he') : translate;
  const prefix = `content.landing.${landingKey}`;

  const sections = t(`${prefix}.sections`, { returnObjects: true }) as LandingSection[];
  const faqs = t(`${prefix}.faqs`, { returnObjects: true }) as LandingFaq[];
  const related = t(`${prefix}.related`, { returnObjects: true }) as RelatedLink[];

  const seoTitle = t(`seo.${landingKey}.title`);
  const seoDescription = t(`seo.${landingKey}.description`);
  const articleHeadline = t(`${prefix}.title`);
  const isArticle = ARTICLE_LANDING_KEYS.has(landingKey);
  const blogName = t('content.blog.title');

  const crumbs = [
    { name: t('nav.home'), path: '/' },
    ...(section ? [{ name: t(section.labelKey), path: section.path }] : []),
    { name: seoTitle, path },
  ];

  useSeo({
    title: seoTitle,
    description: seoDescription,
    path,
    language: locale === 'he' ? 'he' : undefined,
    alternates,
    type: isArticle ? 'article' : 'website',
    jsonLd: buildJsonLdGraph([
      buildBreadcrumbJsonLd(crumbs),
      ...(isArticle
        ? [
            buildArticleJsonLd({
              headline: articleHeadline,
              description: seoDescription,
              path,
              ...(section
                ? { blog: { name: blogName, path: section.path } }
                : {}),
            }),
          ]
        : []),
      buildFaqPageJsonLdFromItems(faqs, path),
    ]),
  });

  return (
    <Layout>
      <article className="content-page">
        {section ? (
          <nav className="content-crumbs" aria-label={t('nav.breadcrumb')}>
            <Link to="/">{t('nav.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link to={section.path}>{t(section.labelKey)}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{seoTitle}</span>
          </nav>
        ) : null}
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
                <Link to={localizeHref(item.to, locale)}>{t(item.labelKey)}</Link>
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
