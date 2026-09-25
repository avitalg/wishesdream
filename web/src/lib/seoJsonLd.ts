import i18n from '../i18n/index.js';
import { AREA_SERVED, SITE_NAME, absoluteUrl, type ServiceArea } from '../config/site.js';

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

function spatialCoverageForPath(path: string) {
  if (path.startsWith('/he/') || path === '/he') {
    const israel = AREA_SERVED.find((area) => area.code === 'IL');
    return israel ? placeNode(israel) : undefined;
  }

  return areaServedNodes();
}

function stripContext(node: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...node };
  delete rest['@context'];
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

export function buildArticleJsonLd(options: {
  headline: string;
  description: string;
  path: string;
  blog?: { name: string; path: string };
}) {
  return {
    '@type': 'BlogPosting',
    headline: options.headline,
    description: options.description,
    image: absoluteUrl('/og-image.png'),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/og-image.png'),
      },
    },
    inLanguage: options.path.startsWith('/he/') ? 'he' : 'en',
    spatialCoverage: spatialCoverageForPath(options.path),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(options.path),
    },
    ...(options.blog
      ? {
          isPartOf: {
            '@type': 'Blog',
            name: options.blog.name,
            url: absoluteUrl(options.blog.path),
          },
        }
      : {}),
  };
}

export function buildBlogJsonLd(options: {
  name: string;
  description: string;
  path?: string;
  posts: Array<{ headline: string; description: string; path: string }>;
}) {
  const path = options.path ?? '/blog';
  return {
    '@type': 'Blog',
    name: options.name,
    description: options.description,
    inLanguage: path.startsWith('/he/') ? 'he' : 'en',
    spatialCoverage: spatialCoverageForPath(path),
    url: absoluteUrl(path),
    blogPost: options.posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.headline,
      description: post.description,
      url: absoluteUrl(post.path),
    })),
  };
}

export function buildFaqPageJsonLdFromItems(
  items: Array<{ question: string; answer: string }>,
  path = '/',
) {
  return {
    '@type': 'FAQPage',
    spatialCoverage: spatialCoverageForPath(path),
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
    spatialCoverage: areaServedNodes(),
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
      areaServed: areaServedNodes(),
      eligibleRegion: areaServedNodes(),
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

  const language = i18n.language.startsWith('he') ? 'he' : 'en';

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    spatialCoverage: spatialCoverageForPath(language === 'he' ? '/he' : '/'),
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
