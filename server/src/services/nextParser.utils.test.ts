import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  extractNextItemNumber,
  formatNextPrice,
  getNextImageUrl,
  getNextTerritory,
  isNextUrl,
} from '../services/nextParser.utils.js';

describe('nextParser.utils', () => {
  it('detects Next URLs', () => {
    assert.equal(isNextUrl('https://www.next.co.il/en/style/su775634/h53742'), true);
    assert.equal(isNextUrl('https://www.amazon.com/dp/B012345678'), false);
  });

  it('extracts item numbers from style URLs', () => {
    assert.equal(extractNextItemNumber('/en/style/su775634/h53742'), 'H53742');
    assert.equal(extractNextItemNumber('/shop/baby'), null);
  });

  it('maps hostnames to territories', () => {
    assert.equal(getNextTerritory('www.next.co.il'), 'IL');
    assert.equal(getNextTerritory('www.next.co.uk'), 'GB');
  });

  it('formats price ranges with currency symbols', () => {
    assert.equal(
      formatNextPrice({ currencyCode: 'ILS', price: { minPrice: 79, maxPrice: 97 } }),
      '₪79 - ₪97',
    );
    assert.equal(
      formatNextPrice({ currencyCode: 'GBP', price: { minPrice: 18, maxPrice: 18 } }),
      '£18',
    );
  });

  it('builds CDN image URLs', () => {
    assert.match(
      getNextImageUrl([{ name: 'H53742s', isHeroImage: true }], 'H53742') ?? '',
      /H53742s\.jpg/,
    );
  });
});
