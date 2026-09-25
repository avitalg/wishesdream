import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { BLOG_ARTICLES, blogAlternates, BLOG_PATH, type BlogLocale, localizedBlogPath } from '../content/blog.js';
import { useSeo } from '../hooks/useSeo.js';
import { buildBlogJsonLd, buildBreadcrumbJsonLd, buildJsonLdGraph } from '../lib/seoJsonLd.js';

export function BlogPage({ locale = 'en' }: { locale?: BlogLocale }) {
  const { t: translate, i18n } = useTranslation();
  const t = locale === 'he' ? i18n.getFixedT('he') : translate;
  const path = localizedBlogPath(BLOG_PATH, locale);
  const blogName = t('content.blog.title');
  const blogDescription = t('seo.blog.description');

  const posts = BLOG_ARTICLES.map((article) => ({
    path: localizedBlogPath(article.path, locale),
    headline: t(`content.landing.${article.landingKey}.title`),
    description: t(`content.landing.${article.landingKey}.lead`),
  }));

  useSeo({
    title: t('seo.blog.title'),
    description: blogDescription,
    path,
    language: locale === 'he' ? 'he' : undefined,
    alternates: blogAlternates(BLOG_PATH),
    jsonLd: buildJsonLdGraph([
      buildBreadcrumbJsonLd([
        { name: t('nav.home'), path: '/' },
        { name: t('nav.blog'), path },
      ]),
      buildBlogJsonLd({
        name: blogName,
        description: blogDescription,
        path,
        posts,
      }),
    ]),
  });

  return (
    <Layout>
      <article className="content-page">
        <nav className="content-crumbs" aria-label={t('nav.breadcrumb')}>
          <Link to="/">{t('nav.home')}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{t('nav.blog')}</span>
        </nav>
        <p className="eyebrow">{t('content.blog.eyebrow')}</p>
        <h1>{blogName}</h1>
        <p className="content-lead">{t('content.blog.lead')}</p>

        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.path}>
              <Link to={post.path} className="blog-card">
                <h2>{post.headline}</h2>
                <p>{post.description}</p>
                <span className="blog-card__more">{t('content.blog.readArticle')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </Layout>
  );
}
