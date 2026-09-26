import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { injectMarketingSeo } from './marketingSeoHtml.js';

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta name="description" content="default desc" />
    <meta property="og:title" content="old og title" />
    <meta property="og:description" content="old og desc" />
    <meta property="og:image" content="/og-image.png" />
    <meta property="og:image:alt" content="old alt" />
    <meta name="twitter:title" content="old tw title" />
    <meta name="twitter:description" content="old tw desc" />
    <meta name="twitter:image" content="/og-image.png" />
    <meta name="twitter:image:alt" content="old tw alt" />
    <meta name="geo.region" content="US" />
    <meta name="geo.placename" content="United States" />
    <title>Old Title</title>
  </head>
  <body><div id="root"></div></body>
</html>`;

const SITE_URL = 'https://wishgather.com';

describe('injectMarketingSeo', () => {
  it('injects FAQ title, description, canonical, and FAQ JSON-LD', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/faq', SITE_URL);

    assert.match(html, /<title>FAQ — WishGather<\/title>/);
    assert.match(
      html,
      /meta name="description" content="Answers about WishGather gift registries/,
    );
    assert.match(html, /link rel="canonical" href="https:\/\/wishgather.com\/faq"/);
    assert.match(html, /property="og:url" content="https:\/\/wishgather.com\/faq"/);
    assert.match(html, /id="server-marketing-jsonld"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /Do guests need to create an account\?/);
    assert.doesNotMatch(html, /geo\.region/);
    assert.doesNotMatch(html, /geo\.placename/);
    assert.match(html, /"@type":"Place","name":"Europe"/);
  });

  it('injects landing page meta for gift registry', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/gift-registry', SITE_URL);

    assert.match(html, /<title>Free Online Gift Registry — WishGather<\/title>/);
    assert.match(html, /link rel="canonical" href="https:\/\/wishgather.com\/gift-registry"/);
    assert.match(html, /"@type":"WebPage"/);
  });

  it('returns unchanged HTML for non-indexable paths', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/register', SITE_URL);
    assert.equal(html, SAMPLE_HTML);
  });

  it('injects blog index meta and Blog JSON-LD', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/blog', SITE_URL);

    assert.match(html, /<title>Blog — WishGather<\/title>/);
    assert.match(html, /link rel="canonical" href="https:\/\/wishgather.com\/blog"/);
    assert.match(html, /"@type":"Blog"/);
    assert.match(html, /https:\/\/wishgather.com\/blog\/gift-list/);
    assert.match(html, /https:\/\/wishgather.com\/blog\/wishlist/);
  });

  it('injects gift list article meta and BlogPosting JSON-LD', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/blog/gift-list', SITE_URL);

    assert.match(html, /<title>Gift List — WishGather<\/title>/);
    assert.match(html, /link rel="canonical" href="https:\/\/wishgather.com\/blog\/gift-list"/);
    assert.match(html, /Gift list guide: how to create and share/);
    assert.match(html, /"@type":"BlogPosting"/);
    assert.match(html, /"datePublished":"2026-09-26"/);
    assert.match(html, /"dateModified":"2026-09-26"/);
    assert.equal(html.match(/"datePublished"/g)?.length, 1);
    assert.match(html, /Gift List: How to Create and Share the Perfect Gift Wishlist/);
    assert.match(html, /"name":"Blog"/);
  });

  it('injects wishlist article meta and BlogPosting JSON-LD', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/blog/wishlist', SITE_URL);

    assert.match(html, /<title>Gift Wishlist — WishGather<\/title>/);
    assert.match(html, /Why create a gift wishlist\?/i);
    assert.match(html, /"@type":"BlogPosting"/);
    assert.match(html, /Why Create a Gift Wishlist\?/);
  });

  it('leaves unknown blog slugs unchanged', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/blog/not-a-post', SITE_URL);
    assert.equal(html, SAMPLE_HTML);
  });

  it('injects Hebrew article HTML, hreflang, and Hebrew BlogPosting JSON-LD', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/he/blog/gift-list', SITE_URL);

    assert.match(html, /<html lang="he" dir="rtl">/);
    assert.match(html, /<title>רשימת מתנות — WishGather<\/title>/);
    assert.match(html, /link rel="canonical" href="https:\/\/wishgather.com\/he\/blog\/gift-list"/);
    assert.match(html, /hreflang="he" href="https:\/\/wishgather.com\/he\/blog\/gift-list"/);
    assert.match(html, /hreflang="he-IL" href="https:\/\/wishgather.com\/he\/blog\/gift-list"/);
    assert.match(html, /hreflang="en" href="https:\/\/wishgather.com\/blog\/gift-list"/);
    assert.match(html, /name="geo.region" content="IL"/);
    assert.match(html, /name="geo.placename" content="Israel"/);
    assert.match(html, /"datePublished":"2026-09-26"/);
    assert.match(html, /"spatialCoverage":\{"@type":"Country","name":"Israel"/);
    assert.match(html, /property="og:locale" content="he_IL"/);
    assert.match(html, /"inLanguage":"he"/);
    assert.match(html, /איך יוצרים ומשתפים מתנות בלי כפילויות/);
    assert.match(html, /<div id="root"><article lang="he" dir="rtl">/);
    assert.match(html, /href="\/he\/blog"/);
  });

  it('injects Hebrew blog index links to Hebrew articles', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/he/blog', SITE_URL);

    assert.match(html, /<title>בלוג — WishGather<\/title>/);
    assert.match(html, /href="\/he\/blog\/gift-list"/);
    assert.match(html, /href="\/he\/blog\/wishlist"/);
    assert.match(html, /"inLanguage":"he"/);
  });

  it('links English articles to the Hebrew versions', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/blog/wishlist', SITE_URL);

    assert.match(html, /hreflang="he" href="https:\/\/wishgather.com\/he\/blog\/wishlist"/);
    assert.match(html, /hreflang="x-default" href="https:\/\/wishgather.com\/blog\/wishlist"/);
  });
});
