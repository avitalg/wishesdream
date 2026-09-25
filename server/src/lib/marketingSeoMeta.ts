import en from '../../../web/src/i18n/locales/en.json' with { type: 'json' };
import { INDEXABLE_PATHS } from './seoConfig.js';

const SITE_NAME = 'WishGather';
const DEFAULT_IMAGE_ALT = en.seo.defaultImageAlt;
const DEFAULT_DESCRIPTION = en.seo.defaultDescription;
const AREA_SERVED = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Israel',
  'Europe',
] as const;

export type IndexablePath = (typeof INDEXABLE_PATHS)[number];

const LANDING_SEO_KEYS: Record<string, keyof typeof en.seo> = {
  '/gift-registry': 'giftRegistry',
  '/baby-shower-registry': 'babyShowerRegistry',
  '/birthday-wish-list': 'birthdayWishList',
  '/compare': 'compare',
};

export interface MarketingSeoPayload {
  path: IndexablePath;
  pageTitle: string;
  description: string;
  jsonLd: Record<string, unknown>;
}

export function normalizeIndexablePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

export function isIndexableMarketingPath(pathname: string): pathname is IndexablePath {
  const normalized = normalizeIndexablePath(pathname);
  return (INDEXABLE_PATHS as readonly string[]).includes(normalized);
}

function areaServedNodes() {
  return AREA_SERVED.map((name) => ({
    '@type': 'Country',
    name,
  }));
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

function buildFaqPage(items: Array<{ question: string; answer: string }>) {
  return {
    '@type': 'FAQPage',
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
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}

function resolveTitleAndDescription(path: IndexablePath): { title: string; description: string } {
  if (path === '/') {
    return {
      title: en.seo.defaultTitle,
      description: en.seo.home.description,
    };
  }

  const landingKey = LANDING_SEO_KEYS[path];
  if (landingKey) {
    const block = en.seo[landingKey] as { title: string; description: string };
    return { title: block.title, description: block.description };
  }

  const keyMap: Record<string, keyof typeof en.seo> = {
    '/how-it-works': 'howItWorks',
    '/faq': 'faq',
    '/privacy': 'privacy',
    '/cookies': 'cookies',
  };

  const key = keyMap[path];
  const block = en.seo[key] as { title: string; description: string };
  return { title: block.title, description: block.description };
}

function landingFaqs(path: IndexablePath): Array<{ question: string; answer: string }> | null {
  const landingKey = LANDING_SEO_KEYS[path];
  if (!landingKey) {
    return null;
  }

  const content = en.content.landing as Record<
    string,
    { faqs?: Array<{ question: string; answer: string }> }
  >;
  return content[landingKey]?.faqs ?? null;
}

function buildJsonLdForPath(
  siteUrl: string,
  path: IndexablePath,
  pageName: string,
  description: string,
): Record<string, unknown> {
  const homeCrumb = { name: 'Home', path: '/' };

  if (path === '/') {
    return buildJsonLdGraph([
      buildOrganization(siteUrl),
      buildWebSite(siteUrl),
      buildWebApplication(siteUrl),
    ]);
  }

  if (path === '/faq') {
    const faqItems = en.content.faq.items;
    return buildJsonLdGraph([
      buildBreadcrumb(siteUrl, [homeCrumb, { name: pageName, path }]),
      buildFaqPage(faqItems),
    ]);
  }

  const landingFaq = landingFaqs(path);
  const nodes: Array<Record<string, unknown>> = [
    buildBreadcrumb(siteUrl, [homeCrumb, { name: pageName, path }]),
    buildWebPage(siteUrl, path, pageName, description),
  ];

  if (landingFaq && landingFaq.length > 0) {
    nodes.push(buildFaqPage(landingFaq));
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
  };
}

export function getDefaultOgImageAlt(): string {
  return DEFAULT_IMAGE_ALT;
}
