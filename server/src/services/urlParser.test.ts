import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeProductUrl } from '../lib/productUrlNormalize.js';
import { isAmazonUrl } from './amazonParser.utils.js';
import { isNextUrl } from './nextParser.utils.js';

/** Mirrors parseProductUrl routing checks without network I/O. */
function getParserRoute(url: string): 'amazon' | 'next' | 'generic' {
  const normalizedUrl = normalizeProductUrl(url);
  if (isAmazonUrl(normalizedUrl)) {
    return 'amazon';
  }
  if (isNextUrl(normalizedUrl)) {
    return 'next';
  }
  return 'generic';
}

describe('urlParser routing', () => {
  it('routes Nautica and similar retailers to the generic parser', () => {
    const nauticaUrl =
      'https://www.nautica.co.il/kds33504sp25-crl?utm_source=google&utm_medium=cpc&utm_campaign=wipsem&gclid=CjwKCAjwnvTUBhBoEiwAZNDxZ5yx';

    assert.equal(getParserRoute(nauticaUrl), 'generic');
    assert.equal(isAmazonUrl(normalizeProductUrl(nauticaUrl)), false);
  });

  it('still routes real Amazon URLs to the Amazon parser', () => {
    assert.equal(getParserRoute('https://www.amazon.com/dp/B0C4B2KFXM'), 'amazon');
    assert.equal(getParserRoute('https://a.co/d/abc123'), 'amazon');
    assert.equal(getParserRoute('https://amzn.to/xyz'), 'amazon');
  });

  it('routes Next URLs to the Next parser', () => {
    assert.equal(
      getParserRoute('https://www.next.co.il/en/style/su775634/h53742'),
      'next',
    );
  });
});
