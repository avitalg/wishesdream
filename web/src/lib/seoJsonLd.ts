import i18n from '../i18n/index.js';
import { AREA_SERVED, SITE_NAME, absoluteUrl } from '../config/site.js';

function areaServedNodes() {
  return AREA_SERVED.map((name) => ({
    '@type': 'Country',
    name,
  }));
}

function stripContext(node: Record<string, unknown>): Record<string, unknown> {
  const { '@context': _context, ...rest } = node;
  return rest;
}

export function buildJsonLdGraph(nodes: Array<Record<string, unknown>>) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map(stripContext),
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/og-image.png'),
    description: i18n.t('seo.defaultDescription'),
    areaServed: areaServedNodes(),
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    inLanguage: ['en', 'he'],
    description: i18n.t('seo.defaultDescription'),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

export function buildWebApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    description: i18n.t('seo.defaultDescription'),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    areaServed: areaServedNodes(),
    availableLanguage: ['en', 'he'],
  };
}

export function buildFaqPageJsonLd() {
  const items = i18n.t('content.faq.items', { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  return {
    '@context': 'https://schema.org',
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
