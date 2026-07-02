import type { ParsedProduct } from './parsedProduct.js';
import {
  extractAmazonAsin,
  getAmazonImageUrl,
  getAmazonProductUrl,
  isAmazonBotBlock,
  isAmazonUrl,
} from './amazonParser.utils.js';
import {
  fetchAmazonHtml,
  fetchAmazonHtmlOnce,
  fetchAmazonViaMicrolink,
  mergeAmazonResults,
} from './amazonFetch.js';
import { parseAmazonHtml } from './amazonHtmlParser.js';

export type { ParsedProduct } from './parsedProduct.js';
export {
  extractAmazonAsin,
  getAmazonImageUrl,
  getAmazonProductUrl,
  isAmazonUrl,
} from './amazonParser.utils.js';

export async function parseAmazonProductUrl(url: string): Promise<ParsedProduct> {
  const asin = extractAmazonAsin(url);
  if (!asin) {
    throw new Error('Could not extract Amazon product ID from URL');
  }

  const productUrl = getAmazonProductUrl(asin);
  let directResult: ParsedProduct | null = null;
  const directHtml = await fetchAmazonHtml(productUrl);

  if (directHtml && !isAmazonBotBlock(directHtml)) {
    directResult = parseAmazonHtml(directHtml, asin);
  } else if (process.env.SCRAPERAPI_KEY) {
    const scraperHtml = await fetchAmazonHtml(productUrl, true);
    if (scraperHtml && !isAmazonBotBlock(scraperHtml)) {
      directResult = parseAmazonHtml(scraperHtml, asin);
    }
  }

  const microlinkResult = directResult?.price ? null : await fetchAmazonViaMicrolink(productUrl);
  let merged = mergeAmazonResults(directResult, microlinkResult, asin, getAmazonImageUrl(asin));

  if (!merged.price) {
    const priceHtml =
      (await fetchAmazonHtmlOnce(productUrl)) ??
      (process.env.SCRAPERAPI_KEY ? await fetchAmazonHtml(productUrl, true) : null);
    if (priceHtml) {
      const priceOnly = parseAmazonHtml(priceHtml, asin);
      merged = {
        ...merged,
        price: priceOnly.price ?? merged.price,
        title: merged.title === 'Amazon Product' ? priceOnly.title : merged.title,
      };
    }
  }

  return merged;
}
