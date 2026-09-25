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

  it('injects gift list article meta and Article JSON-LD', () => {
    const html = injectMarketingSeo(SAMPLE_HTML, '/gift-list', SITE_URL);

    assert.match(html, /<title>Gift List — WishGather<\/title>/);
    assert.match(html, /Gift list guide: how to create and share/);
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /Gift List: How to Create and Share the Perfect Gift Wishlist/);
  });
});
