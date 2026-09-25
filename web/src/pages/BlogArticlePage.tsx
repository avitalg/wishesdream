import { useParams } from 'react-router-dom';
import { blogAlternates, BLOG_PATH, type BlogLocale, findBlogArticle, localizedBlogPath } from '../content/blog.js';
import { MarketingLandingPage } from './MarketingLandingPage.js';
import { NotFoundPage } from './NotFoundPage.js';

export function BlogArticlePage({ locale = 'en' }: { locale?: BlogLocale }) {
  const { slug } = useParams();
  const article = findBlogArticle(slug);

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <MarketingLandingPage
      landingKey={article.landingKey}
      path={localizedBlogPath(article.path, locale)}
      locale={locale}
      alternates={blogAlternates(article.path)}
      section={{ labelKey: 'nav.blog', path: localizedBlogPath(BLOG_PATH, locale) }}
    />
  );
}
