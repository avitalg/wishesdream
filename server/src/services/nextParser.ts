import type { ParsedProduct } from './parsedProduct.js';
import {
  extractNextItemNumber,
  findNextColourway,
  formatNextPrice,
  getNextImageUrl,
  getNextLanguage,
  getNextTerritory,
  type NextProductSummary,
} from './nextParser.utils.js';

interface NextProductSummaryResponse {
  items?: Array<{
    productData?: {
      data?: {
        productSummary?: NextProductSummary;
      };
    };
  }>;
}

async function fetchNextProductSummary(
  itemNumber: string,
  territory: string,
  language: string,
): Promise<NextProductSummary | null> {
  const endpoint = new URL('https://api.nextdirect.com/api/edge-aggregator/product-summary/v1/index.json');
  endpoint.searchParams.set('realm', 'next');
  endpoint.searchParams.set('territory', territory);
  endpoint.searchParams.set('language', language);
  endpoint.searchParams.set('productIds', `${itemNumber}|PRODUCT`);

  const response = await fetch(endpoint.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as NextProductSummaryResponse;
  return payload.items?.[0]?.productData?.data?.productSummary ?? null;
}

export async function parseNextProductUrl(url: string): Promise<ParsedProduct> {
  const parsedUrl = new URL(url);
  const itemNumber = extractNextItemNumber(parsedUrl.pathname);

  if (!itemNumber) {
    throw new Error('Could not extract Next product ID from URL');
  }

  const summary = await fetchNextProductSummary(
    itemNumber,
    getNextTerritory(parsedUrl.hostname),
    getNextLanguage(parsedUrl.pathname),
  );

  if (!summary) {
    throw new Error('Could not fetch product details from Next');
  }

  const colourway = findNextColourway(summary.colourways, itemNumber);

  return {
    title: colourway?.title ?? summary.title ?? 'Next Product',
    price: formatNextPrice(colourway?.price),
    image_url: getNextImageUrl(summary.media, itemNumber),
  };
}

export { isNextUrl } from './nextParser.utils.js';
