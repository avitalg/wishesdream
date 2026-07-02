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
    assert.equal(isAmazonUrl('https://www.next.co.il/en/style/su775634/h53742'), false);
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
