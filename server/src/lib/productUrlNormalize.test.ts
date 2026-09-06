import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductUrl } from './productUrlNormalize.js';

describe('normalizeProductUrl', () => {
  it('rewrites AliExpress landing pages to item URLs', () => {
    const landing =
      'https://www.aliexpress.com/p/tesla-landing/index.html?productId=1005012430000736&foo=bar';
    assert.equal(
      normalizeProductUrl(landing),
      'https://www.aliexpress.com/item/1005012430000736.html',
    );
  });

  it('strips tracking params from AliExpress item URLs', () => {
    const tracked =
      'https://he.aliexpress.com/item/1005012702426021.html?spm=abc&gatewayAdapt=glo2isr';
    assert.equal(
      normalizeProductUrl(tracked),
      'https://www.aliexpress.com/item/1005012702426021.html',
    );
  });

  it('leaves canonical AliExpress item URLs unchanged', () => {
    const item = 'https://www.aliexpress.com/item/1005012430000736.html';
    assert.equal(normalizeProductUrl(item), item);
  });

  it('leaves unrelated URLs unchanged', () => {
    const shein = 'https://il.shein.com/ark/5470?goods_id=492206840';
    assert.equal(normalizeProductUrl(shein), shein);

    const nautica =
      'https://www.nautica.co.il/kds33504sp25-crl?utm_source=google&utm_medium=cpc&gclid=abc';
    assert.equal(normalizeProductUrl(nautica), nautica);
  });
});
