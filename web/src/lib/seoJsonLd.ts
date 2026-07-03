import i18n from '../i18n/index.js';
import { AREA_SERVED, SITE_NAME, absoluteUrl } from '../config/site.js';

function areaServedNodes() {
  return AREA_SERVED.map((name) => ({
    '@type': 'Country',
    name,
  }));
}

function currentLanguage(): string {
  return i18n.language.startsWith('he') ? 'he' : 'en';
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
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
    inLanguage: currentLanguage(),
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
