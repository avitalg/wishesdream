import { isAmazonUrl, parseAmazonProductUrl } from './amazonParser.js';
import { parseGenericProductHtml } from './genericParser.js';
import { isNextUrl, parseNextProductUrl } from './nextParser.js';
import { normalizeProductUrl } from '../lib/productUrlNormalize.js';
import { ParseUrlError, parseErrorMessage, isIncompleteProduct } from '../lib/parseErrors.js';
import { safeFetch } from '../lib/safeUrl.js';

export type { ParsedProduct } from './parsedProduct.js';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function parseProductUrl(url: string) {
  const normalizedUrl = normalizeProductUrl(url);

  if (isAmazonUrl(normalizedUrl)) {
    return parseAmazonProductUrl(normalizedUrl);
  }

  if (isNextUrl(normalizedUrl)) {
    return parseNextProductUrl(normalizedUrl);
  }

  const response = await safeFetch(normalizedUrl, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new ParseUrlError('FETCH_FAILED', parseErrorMessage('FETCH_FAILED'));
  }

  const html = await response.text();
  const parsed = parseGenericProductHtml(html);

  if (isIncompleteProduct(parsed)) {
    throw new ParseUrlError('NO_PRODUCT_DATA', parseErrorMessage('NO_PRODUCT_DATA'));
  }

  return parsed;
}
