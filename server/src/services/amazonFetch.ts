import type { ParsedProduct } from './parsedProduct.js';
import {
  isAmazonBotBlock,
  isGenericAmazonImage,
  parseAmazonTitleFromDescription,
} from './amazonParser.utils.js';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
  Referer: 'https://www.google.com/',
  Cookie: 'i18n-prefs=USD; lc-main=en_US',
};

interface MicrolinkResponse {
  status: string;
  data?: {
    title?: string;
    description?: string;
    image?: { url?: string } | string;
    price?: string;
  };
}

export async function fetchAmazonHtmlOnce(url: string): Promise<string | null> {
  const response = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  return isAmazonBotBlock(html) ? null : html;
}

export async function fetchAmazonHtml(url: string, useScraperApi = false): Promise<string | null> {
  const scraperApiKey = process.env.SCRAPERAPI_KEY;

  if (useScraperApi && scraperApiKey) {
    const scraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(30000) });
    if (response.ok) {
      return response.text();
    }
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }

    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      continue;
    }

    const html = await response.text();
    if (!isAmazonBotBlock(html)) {
      return html;
    }
  }

  return null;
}

export async function fetchAmazonViaMicrolink(productUrl: string): Promise<ParsedProduct | null> {
  const endpoint = new URL('https://api.microlink.io/');
  endpoint.searchParams.set('url', productUrl);
  endpoint.searchParams.set('timeout', '25000');
  if (process.env.MICROLINK_API_KEY) {
    endpoint.searchParams.set('apiKey', process.env.MICROLINK_API_KEY);
  }

  const response = await fetch(endpoint.toString(), {
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as MicrolinkResponse;
  if (payload.status !== 'success' || !payload.data) {
    return null;
  }

  const { title, description, image, price } = payload.data;
  const imageUrl = typeof image === 'string' ? image : image?.url ?? null;
  const resolvedTitle =
    title && title !== 'Product gallery' && title !== 'Amazon.com'
      ? title
      : (description ? parseAmazonTitleFromDescription(description) : null) ?? 'Amazon Product';

  return {
    title: resolvedTitle,
    image_url: imageUrl && !isGenericAmazonImage(imageUrl) ? imageUrl : null,
    price: price ?? null,
  };
}

export function mergeAmazonResults(
  direct: ParsedProduct | null,
  microlink: ParsedProduct | null,
  asin: string,
  fallbackImageUrl: string,
): ParsedProduct {
  return {
    title:
      (direct?.title && direct.title !== 'Amazon.com' ? direct.title : null) ??
      microlink?.title ??
      'Amazon Product',
    image_url: direct?.image_url ?? microlink?.image_url ?? fallbackImageUrl,
    price: direct?.price ?? microlink?.price ?? null,
  };
}
