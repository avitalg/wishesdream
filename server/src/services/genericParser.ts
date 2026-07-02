import * as cheerio from 'cheerio';
import type { ParsedProduct } from './parsedProduct.js';

function getMetaContent($: cheerio.CheerioAPI, selectors: string[]): string | null {
  for (const selector of selectors) {
    const content = $(selector).attr('content')?.trim();
    if (content) {
      return content;
    }
  }
  return null;
}

export function extractPriceFromHtml($: cheerio.CheerioAPI, html: string): string | null {
  const ogPrice = getMetaContent($, [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
  ]);
  if (ogPrice) {
    const currency = getMetaContent($, [
      'meta[property="product:price:currency"]',
      'meta[property="og:price:currency"]',
    ]);
    return currency ? `${currency} ${ogPrice}` : ogPrice;
  }

  const displayPrice = html.match(/"displayPrice"\s*:\s*"([^"]+)"/)?.[1];
  if (displayPrice) {
    return displayPrice;
  }

  const jsonLdScripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const raw = jsonLdScripts.eq(i).html();
      if (!raw) {
        continue;
      }
      const data = JSON.parse(raw) as Record<string, unknown> | Array<Record<string, unknown>>;
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        const offers = node.offers as Record<string, unknown> | Array<Record<string, unknown>> | undefined;
        if (!offers) {
          continue;
        }
        const offerList = Array.isArray(offers) ? offers : [offers];
        for (const offer of offerList) {
          const price = offer.price ?? offer.lowPrice;
          if (price !== undefined && price !== null) {
            const currency = offer.priceCurrency ?? '';
            return currency ? `${currency} ${price}` : String(price);
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  return null;
}

export function parseGenericProductHtml(html: string): ParsedProduct {
  const $ = cheerio.load(html);

  const rawTitle =
    getMetaContent($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ??
    $('title').first().text().trim();

  const title = rawTitle || 'Untitled Product';

  const image_url =
    getMetaContent($, ['meta[property="og:image"]', 'meta[name="twitter:image"]']) ?? null;

  const price = extractPriceFromHtml($, html);

  return { title, image_url, price };
}
