import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseGenericProductHtml } from '../services/genericParser.js';

const sampleHtml = `
  <html>
    <head>
      <meta property="og:title" content="Soft Blanket" />
      <meta property="og:image" content="https://cdn.example.com/blanket.jpg" />
      <meta property="product:price:amount" content="29.99" />
      <meta property="product:price:currency" content="USD" />
    </head>
  </html>
`;

describe('genericParser', () => {
  it('parses Open Graph product metadata', () => {
    const result = parseGenericProductHtml(sampleHtml);
    assert.equal(result.title, 'Soft Blanket');
    assert.equal(result.image_url, 'https://cdn.example.com/blanket.jpg');
    assert.equal(result.price, 'USD 29.99');
  });

  it('falls back to Untitled Product when metadata is missing', () => {
    const result = parseGenericProductHtml('<html><head><title></title></head></html>');
    assert.equal(result.title, 'Untitled Product');
    assert.equal(result.image_url, null);
    assert.equal(result.price, null);
  });
});
