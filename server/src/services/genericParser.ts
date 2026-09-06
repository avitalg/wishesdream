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

const GENERIC_SITE_TITLE =
  /^(shein(?:\.com)?|aliexpress(?:\.com)?|amazon(?:\.com)?|untitled product)$/i;

export function isGenericProductTitle(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed || GENERIC_SITE_TITLE.test(trimmed)) {
    return true;
  }
  if (/^SHEIN\b/i.test(trimmed) && trimmed.length < 40) {
    return true;
  }
  if (/^index\.html\?/i.test(trimmed)) {
    return true;
  }
  return false;
}

function isGenericSiteTitle(title: string): boolean {
  return isGenericProductTitle(title);
}

function collectJsonLdNodes(value: unknown, nodes: Record<string, unknown>[]): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsonLdNodes(item, nodes);
    }
    return;
  }

  const record = value as Record<string, unknown>;
  nodes.push(record);

  for (const key of ['hasVariant', '@graph', 'mainEntity', 'itemListElement']) {
    if (key in record) {
      collectJsonLdNodes(record[key], nodes);
    }
  }
}

function formatOfferPrice(offer: Record<string, unknown>): string | null {
  const price = offer.price ?? offer.lowPrice;
  if (price === undefined || price === null) {
    return null;
  }

  const currency = offer.priceCurrency ?? '';
  return currency ? `${currency} ${price}` : String(price);
}

function extractImage(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const image = extractImage(item);
      if (image) {
        return image;
      }
    }
    return null;
  }

  if (value && typeof value === 'object' && 'url' in value) {
    const url = (value as { url?: unknown }).url;
    return typeof url === 'string' ? url : null;
  }

  return null;
}

function isProductLikeNode(node: Record<string, unknown>): boolean {
  const type = node['@type'];
  const types = Array.isArray(type) ? type : type ? [type] : [];
  return types.some((entry) =>
    ['Product', 'ProductGroup', 'IndividualProduct'].includes(String(entry)),
  );
}

function extractOffersPrice(
  offers: Record<string, unknown> | Array<Record<string, unknown>> | undefined,
): string | null {
  if (!offers) {
    return null;
  }

  const offerList = Array.isArray(offers) ? offers : [offers];
  for (const offer of offerList) {
    const price = formatOfferPrice(offer);
    if (price) {
      return price;
    }
  }

  return null;
}

export function extractJsonLdProduct($: cheerio.CheerioAPI): Partial<ParsedProduct> {
  const jsonLdScripts = $('script[type="application/ld+json"]');
  let title: string | null = null;
  let image_url: string | null = null;
  let price: string | null = null;

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const raw = jsonLdScripts.eq(i).html();
      if (!raw) {
        continue;
      }

      const data = JSON.parse(raw) as unknown;
      const nodes: Record<string, unknown>[] = [];
      collectJsonLdNodes(data, nodes);

      for (const node of nodes) {
        if (!isProductLikeNode(node)) {
          continue;
        }

        const nodeTitle = typeof node.name === 'string' ? node.name.trim() : null;
        if (nodeTitle && !isGenericSiteTitle(nodeTitle) && !title) {
          title = nodeTitle;
        }

        if (!image_url) {
          image_url = extractImage(node.image);
        }

        if (!price) {
          price = extractOffersPrice(
            node.offers as Record<string, unknown> | Array<Record<string, unknown>> | undefined,
          );
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  return { title: title ?? undefined, image_url, price };
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

  return extractJsonLdProduct($).price ?? null;
}

export function parseGenericProductHtml(html: string): ParsedProduct {
  const $ = cheerio.load(html);
  const jsonLd = extractJsonLdProduct($);

  const metaTitle =
    getMetaContent($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ??
    $('title').first().text().trim();

  const titleCandidate =
    metaTitle && !isGenericSiteTitle(metaTitle) ? metaTitle : null;
  const title = titleCandidate ?? jsonLd.title ?? 'Untitled Product';

  const image_url =
    getMetaContent($, ['meta[property="og:image"]', 'meta[name="twitter:image"]']) ??
    jsonLd.image_url ??
    null;

  const price = extractPriceFromHtml($, html) ?? jsonLd.price ?? null;

  return { title, image_url, price };
}
