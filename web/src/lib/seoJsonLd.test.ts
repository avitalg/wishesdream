// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { buildArticleJsonLd, buildBlogJsonLd, buildBreadcrumbJsonLd, buildJsonLdGraph } from './seoJsonLd.js';

describe('seoJsonLd', () => {
  it('wraps nodes in a graph without duplicate contexts', () => {
    const graph = buildJsonLdGraph([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'WishGather',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'WishGather',
      },
    ]);

    expect(graph).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'WishGather' },
        { '@type': 'WebSite', name: 'WishGather' },
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

  it('marks Hebrew blog posts with Hebrew language and a Hebrew url', () => {
    const article = buildArticleJsonLd({
      headline: 'רשימת מתנות',
      description: 'מדריך',
      path: '/he/blog/gift-list',
      blog: { name: 'בלוג', path: '/he/blog' },
    });
    const blog = buildBlogJsonLd({
      name: 'בלוג',
      description: 'מדריכים',
      path: '/he/blog',
      posts: [{ headline: 'רשימת מתנות', description: 'מדריך', path: '/he/blog/gift-list' }],
    });

    expect(article.inLanguage).toBe('he');
    expect(article.datePublished).toBe('2026-09-26');
    expect(article.dateModified).toBe('2026-09-26');
    expect(article.spatialCoverage).toMatchObject({
      '@type': 'Country',
      name: 'Israel',
      identifier: 'IL',
    });
    expect(article.isPartOf).toMatchObject({ url: expect.stringMatching(/\/he\/blog$/) });
    expect(blog.inLanguage).toBe('he');
    expect(blog.spatialCoverage).toMatchObject({ name: 'Israel' });
    expect(blog.url).toMatch(/\/he\/blog$/);
    expect(blog.blogPost[0]?.url).toMatch(/\/he\/blog\/gift-list$/);
  });

  it('covers English articles across served regions and types Europe as a place', () => {
    const article = buildArticleJsonLd({
      headline: 'Gift list',
      description: 'Guide',
      path: '/blog/gift-list',
    });

    expect(article.spatialCoverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'Country', name: 'United States', identifier: 'US' }),
        expect.objectContaining({ '@type': 'Place', name: 'Europe' }),
      ]),
    );
  });
});
