import { isAmazonUrl, parseAmazonProductUrl } from './amazonParser.js';
import { parseGenericProductHtml } from './genericParser.js';
import { isNextUrl, parseNextProductUrl } from './nextParser.js';

export type { ParsedProduct } from './parsedProduct.js';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function parseProductUrl(url: string) {
  if (isAmazonUrl(url)) {
    return parseAmazonProductUrl(url);
  }

  if (isNextUrl(url)) {
    return parseNextProductUrl(url);
  }

  const response = await fetch(url, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL (${response.status})`);
  }

  const html = await response.text();
  return parseGenericProductHtml(html);
}
