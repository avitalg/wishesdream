import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isKnownClientRoute } from './seoConfig.js';
import { buildSitemapXml } from './seoRoutes.js';

describe('isKnownClientRoute', () => {
  it('accepts marketing and auth routes', () => {
    assert.equal(isKnownClientRoute('/'), true);
    assert.equal(isKnownClientRoute('/faq'), true);
    assert.equal(isKnownClientRoute('/sitemap'), true);
    assert.equal(isKnownClientRoute('/blog'), true);
    assert.equal(isKnownClientRoute('/blog/gift-list'), true);
    assert.equal(isKnownClientRoute('/blog/wishlist'), true);
    assert.equal(isKnownClientRoute('/he/blog'), true);
    assert.equal(isKnownClientRoute('/he/blog/gift-list'), true);
    assert.equal(isKnownClientRoute('/he/blog/wishlist'), true);
    assert.equal(isKnownClientRoute('/login'), true);
    assert.equal(isKnownClientRoute('/dashboard'), true);
  });

  it('accepts list routes', () => {
    assert.equal(isKnownClientRoute('/lists/abc123'), true);
    assert.equal(isKnownClientRoute('/lists/abc123/manage'), true);
  });

  it('rejects unknown routes', () => {
    assert.equal(isKnownClientRoute('/missing-page'), false);
    assert.equal(isKnownClientRoute('/gift-list'), false);
    assert.equal(isKnownClientRoute('/blog/not-a-post'), false);
    assert.equal(isKnownClientRoute('/he/blog/not-a-post'), false);
    assert.equal(isKnownClientRoute('/lists/'), false);
    assert.equal(isKnownClientRoute('/api/lists'), false);
  });
});

describe('buildSitemapXml', () => {
  it('lists Hebrew articles with hreflang alternates', () => {
    const xml = buildSitemapXml('https://wishgather.com');

    assert.match(xml, /<loc>https:\/\/wishgather.com\/sitemap<\/loc>/);
    assert.match(xml, /<loc>https:\/\/wishgather.com\/he\/blog\/gift-list<\/loc>/);
    assert.match(xml, /<loc>https:\/\/wishgather.com\/he\/blog\/wishlist<\/loc>/);
    assert.match(xml, /hreflang="he" href="https:\/\/wishgather.com\/he\/blog\/gift-list"/);
    assert.match(xml, /hreflang="he-IL" href="https:\/\/wishgather.com\/he\/blog\/gift-list"/);
    assert.match(xml, /hreflang="en" href="https:\/\/wishgather.com\/blog\/gift-list"/);
  });
});
