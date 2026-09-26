import en from '../../../web/src/i18n/locales/en.json' with { type: 'json' };
import heJson from '../../../web/src/i18n/locales/he.json' with { type: 'json' };
import { INDEXABLE_PATHS } from './seoConfig.js';

const he = heJson as unknown as typeof en;

const SITE_NAME = 'WishGather';
const DEFAULT_IMAGE_ALT = en.seo.defaultImageAlt;
const DEFAULT_DESCRIPTION = en.seo.defaultDescription;

interface ServiceArea {
  type: 'Country' | 'Place';
  name: string;
  code?: string;
  sameAs: string;
}

const AREA_SERVED: readonly ServiceArea[] = [
  { type: 'Country', name: 'United States', code: 'US', sameAs: 'https://www.wikidata.org/wiki/Q30' },
  { type: 'Country', name: 'United Kingdom', code: 'GB', sameAs: 'https://www.wikidata.org/wiki/Q145' },
  { type: 'Country', name: 'Canada', code: 'CA', sameAs: 'https://www.wikidata.org/wiki/Q16' },
  { type: 'Country', name: 'Australia', code: 'AU', sameAs: 'https://www.wikidata.org/wiki/Q408' },
  { type: 'Country', name: 'Israel', code: 'IL', sameAs: 'https://www.wikidata.org/wiki/Q801' },
  { type: 'Place', name: 'Europe', sameAs: 'https://www.wikidata.org/wiki/Q46' },
];

export type IndexablePath = (typeof INDEXABLE_PATHS)[number];

const LANDING_SEO_KEYS: Record<string, keyof typeof en.seo> = {
  '/gift-registry': 'giftRegistry',
  '/baby-shower-registry': 'babyShowerRegistry',
  '/birthday-wish-list': 'birthdayWishList',
  '/blog': 'blog',
  '/blog/gift-list': 'giftList',
  '/blog/wishlist': 'giftWishlist',
  '/compare': 'compare',
};

const BLOG_PATH = '/blog';

const BLOG_POSTS: Array<{ path: string; landingKey: string; published: string }> = [
  { path: '/blog/gift-list', landingKey: 'giftList', published: '2026-09-26' },
  { path: '/blog/wishlist', landingKey: 'giftWishlist', published: '2026-09-26' },
];

const ARTICLE_PATHS = new Set<string>(BLOG_POSTS.map((post) => post.path));
const BLOG_INDEXABLE_ENGLISH_PATHS = new Set<string>([BLOG_PATH, ...ARTICLE_PATHS]);

export interface HreflangAlternate {
  hreflang: string;
  path: string;
}

export interface MarketingSeoPayload {
  path: IndexablePath;
  pageTitle: string;
  description: string;
  jsonLd: Record<string, unknown>;
  language: 'en' | 'he';
  geo: { region: string; placename: string } | null;
  alternates?: HreflangAlternate[];
  bodyHtml?: string;
}

function publishedDate(path: string): string | undefined {
  const englishPath = toContentPath(path);
  return BLOG_POSTS.find((post) => post.path === englishPath)?.published;
}

export function blogLastmod(pathname: string): string | undefined {
  return publishedDate(pathname);
}

function articleDateFields(path: string) {
  const published = publishedDate(path);
  if (!published) {
    return {};
  }

  return { datePublished: published, dateModified: published };
}

function toContentPath(path: string): string {
  if (path.startsWith('/he/')) {
    return path.slice(3) || '/';
  }
  return path;
}

function messagesFor(path: string): typeof en {
  return path.startsWith('/he/') ? he : en;
}

function languageFor(path: string): 'en' | 'he' {
  return path.startsWith('/he/') ? 'he' : 'en';
}

function localizedBlogPath(englishPath: string, language: 'en' | 'he'): string {
  return language === 'he' ? `/he${englishPath}` : englishPath;
}

function blogAlternates(path: string): HreflangAlternate[] | undefined {
  const englishPath = toContentPath(path);
  if (!BLOG_INDEXABLE_ENGLISH_PATHS.has(englishPath)) {
    return undefined;
  }

  return [
    { hreflang: 'en', path: englishPath },
    { hreflang: 'he', path: `/he${englishPath}` },
    { hreflang: 'he-IL', path: `/he${englishPath}` },
    { hreflang: 'x-default', path: englishPath },
  ];
}

export function normalizeIndexablePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

export function isIndexableMarketingPath(pathname: string): pathname is IndexablePath {
  const normalized = normalizeIndexablePath(pathname);
  return (INDEXABLE_PATHS as readonly string[]).includes(normalized);
}

function placeNode(area: ServiceArea) {
  return {
    '@type': area.type,
    name: area.name,
    sameAs: area.sameAs,
    ...(area.code ? { identifier: area.code } : {}),
  };
}

function areaServedNodes() {
  return AREA_SERVED.map(placeNode);
}

function geoForLanguage(language: 'en' | 'he'): { region: string; placename: string } | null {
  if (language === 'he') {
    return { region: 'IL', placename: 'Israel' };
  }

  return null;
}

function spatialCoverage(language: 'en' | 'he') {
  if (language === 'he') {
    const israel = AREA_SERVED.find((area) => area.code === 'IL');
    return israel ? placeNode(israel) : undefined;
  }

  return areaServedNodes();
}

function absoluteUrl(siteUrl: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return path === '/' ? siteUrl : `${siteUrl}${normalized}`;
}

function buildJsonLdGraph(nodes: Array<Record<string, unknown>>) {
  const stripContext = (node: Record<string, unknown>) => {
    const rest = { ...node };
    delete rest['@context'];
    return rest;
  };

  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map(stripContext),
  };
}

function buildOrganization(siteUrl: string) {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl,
    logo: absoluteUrl(siteUrl, '/og-image.png'),
    description: DEFAULT_DESCRIPTION,
    areaServed: areaServedNodes(),
  };
}

function buildWebSite(siteUrl: string) {
  return {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: ['en', 'he'],
    spatialCoverage: spatialCoverage('en'),
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

function buildWebApplication(siteUrl: string) {
  return {
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: siteUrl,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    description: DEFAULT_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      areaServed: areaServedNodes(),
      eligibleRegion: areaServedNodes(),
    },
    areaServed: areaServedNodes(),
    availableLanguage: ['en', 'he'],
  };
}

function buildBreadcrumb(siteUrl: string, items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  };
}

function buildFaqPage(items: Array<{ question: string; answer: string }>, language: 'en' | 'he' = 'en') {
  return {
    '@type': 'FAQPage',
    spatialCoverage: spatialCoverage(language),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function buildWebPage(siteUrl: string, path: string, name: string, description: string) {
  return {
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(siteUrl, path),
    spatialCoverage: spatialCoverage(languageFor(path)),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}

function buildArticle(
  siteUrl: string,
  path: string,
  headline: string,
  description: string,
  articleBody: string,
) {
  const copy = messagesFor(path);
  const language = languageFor(path);

  return {
    '@type': 'BlogPosting',
    headline,
    description,
    articleBody,
    inLanguage: language,
    ...articleDateFields(path),
    spatialCoverage: spatialCoverage(language),
    image: absoluteUrl(siteUrl, '/og-image.png'),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(siteUrl, '/og-image.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(siteUrl, path),
    },
    isPartOf: {
      '@type': 'Blog',
      name: copy.content.blog.title,
      url: absoluteUrl(siteUrl, localizedBlogPath(BLOG_PATH, language)),
    },
  };
}

function buildBlog(siteUrl: string, path: string, name: string, description: string) {
  const copy = messagesFor(path);
  const language = languageFor(path);
  const landing = copy.content.landing as Record<string, { title?: string; lead?: string }>;

  return {
    '@type': 'Blog',
    name,
    description,
    inLanguage: language,
    spatialCoverage: spatialCoverage(language),
    url: absoluteUrl(siteUrl, path),
    blogPost: BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      headline: landing[post.landingKey]?.title ?? post.landingKey,
      description: landing[post.landingKey]?.lead ?? '',
      inLanguage: language,
      url: absoluteUrl(siteUrl, localizedBlogPath(post.path, language)),
      ...articleDateFields(localizedBlogPath(post.path, language)),
    })),
  };
}

function articleLanding(path: string): {
  title?: string;
  lead?: string;
  sections?: Array<{ title: string; body: string }>;
} | null {
  const contentPath = toContentPath(path);
  if (!ARTICLE_PATHS.has(contentPath)) {
    return null;
  }

  const landingKey = LANDING_SEO_KEYS[contentPath];
  if (!landingKey) {
    return null;
  }

  const content = messagesFor(path).content.landing as Record<
    string,
    { title?: string; lead?: string; sections?: Array<{ title: string; body: string }> }
  >;
  return content[landingKey] ?? null;
}

function articleHeadline(path: IndexablePath): string | null {
  return articleLanding(path)?.title ?? null;
}

function articleBodyText(path: string): string {
  const landing = articleLanding(path);
  if (!landing) {
    return '';
  }

  const sections = (landing.sections ?? [])
    .map((section) => `${section.title}\n${section.body}`)
    .join('\n\n');
  return [landing.lead, sections].filter(Boolean).join('\n\n');
}

function resolveTitleAndDescription(path: IndexablePath): { title: string; description: string } {
  const copy = messagesFor(path);
  const contentPath = toContentPath(path);

  if (contentPath === '/') {
    return {
      title: copy.seo.defaultTitle,
      description: copy.seo.home.description,
    };
  }

  const landingKey = LANDING_SEO_KEYS[contentPath];
  if (landingKey) {
    const block = copy.seo[landingKey] as { title: string; description: string };
    return { title: block.title, description: block.description };
  }

  const keyMap: Record<string, keyof typeof en.seo> = {
    '/how-it-works': 'howItWorks',
    '/faq': 'faq',
    '/privacy': 'privacy',
    '/cookies': 'cookies',
    '/sitemap': 'sitemap',
  };

  const key = keyMap[contentPath];
  const block = copy.seo[key] as { title: string; description: string };
  return { title: block.title, description: block.description };
}

function landingFaqs(path: IndexablePath): Array<{ question: string; answer: string }> | null {
  const landingKey = LANDING_SEO_KEYS[toContentPath(path)];
  if (!landingKey) {
    return null;
  }

  const content = messagesFor(path).content.landing as Record<
    string,
    { faqs?: Array<{ question: string; answer: string }> }
  >;
  return content[landingKey]?.faqs ?? null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderHebrewBlogBody(path: string): string | undefined {
  if (!path.startsWith('/he/blog')) {
    return undefined;
  }

  const contentPath = toContentPath(path);
  if (contentPath === BLOG_PATH) {
    const items = BLOG_POSTS.map((post) => {
      const landing = he.content.landing as Record<string, { title?: string; lead?: string }>;
      const article = landing[post.landingKey];
      const href = localizedBlogPath(post.path, 'he');
      return `<li><a href="${href}">${escapeHtml(article?.title ?? '')}</a><p>${escapeHtml(article?.lead ?? '')}</p></li>`;
    }).join('');

    return `<article lang="he" dir="rtl"><h1>${escapeHtml(he.content.blog.title)}</h1><p>${escapeHtml(he.content.blog.lead)}</p><ul>${items}</ul></article>`;
  }

  const landing = articleLanding(path);
  if (!landing?.title) {
    return undefined;
  }

  const sections = (landing.sections ?? [])
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`,
    )
    .join('');
  const faqs = (landingFaqs(path as IndexablePath) ?? [])
    .map(
      (item) =>
        `<section><h2>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.answer)}</p></section>`,
    )
    .join('');

  return `<article lang="he" dir="rtl"><p><a href="/he/blog">${escapeHtml(he.nav.blog)}</a></p><h1>${escapeHtml(landing.title)}</h1><p>${escapeHtml(landing.lead ?? '')}</p>${sections}${faqs}</article>`;
}

function buildJsonLdForPath(
  siteUrl: string,
  path: IndexablePath,
  pageName: string,
  description: string,
): Record<string, unknown> {
  const copy = messagesFor(path);
  const contentPath = toContentPath(path);
  const homeCrumb = { name: copy.nav.home, path: '/' };

  if (path === '/') {
    return buildJsonLdGraph([
      buildOrganization(siteUrl),
      buildWebSite(siteUrl),
      buildWebApplication(siteUrl),
    ]);
  }

  if (contentPath === '/faq') {
    const faqItems = copy.content.faq.items;
    return buildJsonLdGraph([
      buildBreadcrumb(siteUrl, [homeCrumb, { name: pageName, path }]),
      buildFaqPage(faqItems, languageFor(path)),
    ]);
  }

  if (contentPath === BLOG_PATH) {
    return buildJsonLdGraph([
      buildBreadcrumb(siteUrl, [homeCrumb, { name: pageName, path }]),
      buildBlog(siteUrl, path, copy.content.blog.title, description),
    ]);
  }

  const landingFaq = landingFaqs(path);
  const headline = articleHeadline(path);
  const blogPath = localizedBlogPath(BLOG_PATH, languageFor(path));
  const crumbs = headline
    ? [homeCrumb, { name: copy.nav.blog, path: blogPath }, { name: pageName, path }]
    : [homeCrumb, { name: pageName, path }];
  const nodes: Array<Record<string, unknown>> = [
    buildBreadcrumb(siteUrl, crumbs),
  ];

  if (headline) {
    nodes.push(buildArticle(siteUrl, path, headline, description, articleBodyText(path)));
  } else {
    nodes.push(buildWebPage(siteUrl, path, pageName, description));
  }

  if (landingFaq && landingFaq.length > 0) {
    nodes.push(buildFaqPage(landingFaq, languageFor(path)));
  }

  return buildJsonLdGraph(nodes);
}

export function getMarketingSeoPayload(
  pathname: string,
  siteUrl: string,
): MarketingSeoPayload | null {
  const path = normalizeIndexablePath(pathname);
  if (!isIndexableMarketingPath(path)) {
    return null;
  }

  const { title, description } = resolveTitleAndDescription(path);
  const pageTitle = `${title} — ${SITE_NAME}`;

  return {
    path,
    pageTitle,
    description,
    jsonLd: buildJsonLdForPath(siteUrl, path, title, description),
    language: languageFor(path),
    geo: geoForLanguage(languageFor(path)),
    alternates: blogAlternates(path),
    bodyHtml: renderHebrewBlogBody(path),
  };
}

export function getDefaultOgImageAlt(): string {
  return DEFAULT_IMAGE_ALT;
}
