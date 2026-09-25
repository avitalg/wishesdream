export const BLOG_PATH = '/blog';
export const HEBREW_BLOG_PATH = '/he/blog';

export const BLOG_ARTICLES = [
  {
    slug: 'gift-list',
    path: '/blog/gift-list',
    landingKey: 'giftList',
  },
  {
    slug: 'wishlist',
    path: '/blog/wishlist',
    landingKey: 'giftWishlist',
  },
] as const;

export type BlogArticle = (typeof BLOG_ARTICLES)[number];
export type BlogLocale = 'en' | 'he';

const BLOG_ENGLISH_PATHS = new Set<string>([BLOG_PATH, ...BLOG_ARTICLES.map((article) => article.path)]);

export function findBlogArticle(slug: string | undefined): BlogArticle | undefined {
  if (!slug) {
    return undefined;
  }

  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

export function toEnglishBlogPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized.startsWith('/he/')) {
    return normalized.slice(3) || '/';
  }
  return normalized;
}

export function isBlogPath(pathname: string): boolean {
  return BLOG_ENGLISH_PATHS.has(toEnglishBlogPath(pathname));
}

export function isHebrewBlogPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized.startsWith('/he/') && isBlogPath(normalized);
}

export function localizedBlogPath(path: string, locale: BlogLocale): string {
  if (locale === 'he' && (path === BLOG_PATH || path.startsWith(`${BLOG_PATH}/`))) {
    return `/he${path}`;
  }
  return path;
}

export function localizeHref(path: string, locale: BlogLocale): string {
  return localizedBlogPath(path, locale);
}

export function blogAlternates(englishPath: string): Array<{ hreflang: string; path: string }> {
  return [
    { hreflang: 'en', path: englishPath },
    { hreflang: 'he', path: `/he${englishPath}` },
    { hreflang: 'he-IL', path: `/he${englishPath}` },
    { hreflang: 'x-default', path: englishPath },
  ];
}

export function blogLocaleFromPath(pathname: string): BlogLocale | null {
  if (!isBlogPath(pathname)) {
    return null;
  }
  return isHebrewBlogPath(pathname) ? 'he' : 'en';
}
