// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { buildBreadcrumbJsonLd, buildJsonLdGraph } from './seoJsonLd.js';

describe('seoJsonLd', () => {
  it('wraps nodes in a graph without duplicate contexts', () => {
    const graph = buildJsonLdGraph([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'WishesDream',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'WishesDream',
      },
    ]);

    expect(graph).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'WishesDream' },
        { '@type': 'WebSite', name: 'WishesDream' },
      ],
    });
  });

  it('builds breadcrumb list items with positions', () => {
    const breadcrumb = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq' },
    ]);

    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0]).toMatchObject({
      position: 1,
      name: 'Home',
    });
    expect(breadcrumb.itemListElement[1]).toMatchObject({
      position: 2,
      name: 'FAQ',
    });
  });
});
