import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  extractAmazonAsin,
  getAmazonImageUrl,
  getAmazonProductUrl,
  isAmazonBotBlock,
  isAmazonUrl,
  isGenericAmazonImage,
  parseAmazonTitleFromPageTitle,
} from '../services/amazonParser.utils.js';

describe('amazonParser.utils', () => {
  it('detects Amazon URLs', () => {
    assert.equal(isAmazonUrl('https://www.amazon.com/dp/B012345678'), true);
    assert.equal(isAmazonUrl('https://a.co/dp/B012345678'), true);
    assert.equal(isAmazonUrl('https://amzn.to/abc123'), true);
    assert.equal(isAmazonUrl('https://amazon.co.uk/dp/B012345678'), true);
    assert.equal(isAmazonUrl('https://www.next.co.il/en/style/su775634/h53742'), false);
    assert.equal(isAmazonUrl('https://www.nautica.co.il/kds33504sp25-crl'), false);
  });

  it('regression: hostnames containing "a.co" are not Amazon', () => {
    const falsePositives = [
      'https://www.nautica.co.il/kds33504sp25-crl?utm_source=google&utm_medium=cpc&gclid=CjwKCAjwnvTUBhBoEiwAZNDxZ5yx',
      'https://nautica.co.il/kds33504sp25-crl',
      'https://www.data.co.il/product/123',
      'https://shop.marca.co.il/item',
      'https://www.example.co.il/path',
      'https://a.co.example.com/product',
      'https://notamazon.com/dp/B012345678',
      'https://amazonfake.com/dp/B012345678',
      'https://www.amazon.com.evil.com/dp/B012345678',
    ];

    for (const url of falsePositives) {
      assert.equal(isAmazonUrl(url), false, `expected non-Amazon: ${url}`);
    }

    assert.equal(
      extractAmazonAsin('https://www.nautica.co.il/kds33504sp25-crl'),
      null,
    );
  });

  it('extracts ASIN from product URLs', () => {
    assert.equal(
      extractAmazonAsin('https://www.amazon.com/Evenflo-Stroller/dp/B0C4B2KFXM/'),
      'B0C4B2KFXM',
    );
    assert.equal(extractAmazonAsin('https://example.com/product'), null);
  });

  it('builds canonical product and image URLs', () => {
    assert.equal(getAmazonProductUrl('B0C4B2KFXM'), 'https://www.amazon.com/gp/product/B0C4B2KFXM');
    assert.match(getAmazonImageUrl('B0C4B2KFXM'), /B0C4B2KFXM/);
  });

  it('detects bot-block pages', () => {
    assert.equal(isAmazonBotBlock('<html><title>Amazon.com</title></html>'), true);
    assert.equal(isAmazonBotBlock('x'.repeat(60000)), false);
  });

  it('filters generic Amazon images', () => {
    assert.equal(isGenericAmazonImage('https://m.media-amazon.com/images/I/abc.jpg'), false);
    assert.equal(isGenericAmazonImage('https://images-na.ssl-images-amazon.com/G/01/icons/amazon.png'), true);
  });

  it('cleans Amazon page titles', () => {
    assert.equal(
      parseAmazonTitleFromPageTitle('Amazon.com : Stroller : Baby'),
      'Stroller : Baby',
    );
  });
});
