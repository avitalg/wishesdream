import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { footerNavGroups } from '../config/navigation.js';
import { BLOG_ARTICLES, localizeHref } from '../content/blog.js';
import { useSeo } from '../hooks/useSeo.js';
import { buildBreadcrumbJsonLd, buildJsonLdGraph } from '../lib/seoJsonLd.js';

export function SitemapPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('he') ? 'he' : 'en';

  useSeo({
    title: t('seo.sitemap.title'),
    description: t('seo.sitemap.description'),
    path: '/sitemap',
    jsonLd: buildJsonLdGraph([
      buildBreadcrumbJsonLd([
        { name: t('nav.home'), path: '/' },
        { name: t('seo.sitemap.title'), path: '/sitemap' },
      ]),
    ]),
  });

  const productLinks = footerNavGroups.product
    .filter((item) => item.labelKey !== 'nav.createList')
    .map((item) => ({
      to: localizeHref(item.to, locale),
      label: t(item.labelKey),
    }));

  const articleLinks = BLOG_ARTICLES.map((article) => ({
    to: localizeHref(article.path, locale),
    label: t(`content.landing.${article.landingKey}.title`),
  }));

  const legalLinks = footerNavGroups.legal
    .filter((item) => item.to !== '/sitemap')
    .map((item) => ({
      to: item.to,
      label: t(item.labelKey),
    }));

  const sections = [
    { title: t('nav.product'), links: productLinks },
    { title: t('content.blog.title'), links: articleLinks },
    { title: t('nav.legal'), links: legalLinks },
  ];

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">{t('content.sitemap.eyebrow')}</p>
        <h1>{t('content.sitemap.title')}</h1>
        <p className="content-lead">{t('content.sitemap.lead')}</p>

        {sections.map((section) => (
          <section key={section.title} className="content-section">
            <h2>{section.title}</h2>
            <ul className="content-list sitemap-list">
              {section.links.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </article>
    </Layout>
  );
}
