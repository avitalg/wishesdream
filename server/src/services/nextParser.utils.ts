const NEXT_HOST_PATTERN = /(?:^|\.)next\.(?:co\.il|co\.uk|ie|com\.au|com|de|fr|es|nl|pl|se|at|ch|be|dk|no|fi)\b/i;
const STYLE_ITEM_PATTERN = /\/style\/([a-z0-9]+)\/([a-z0-9]+)/i;

export const TERRITORY_BY_HOST: Record<string, string> = {
  'next.co.il': 'IL',
  'next.co.uk': 'GB',
  'next.ie': 'IE',
  'next.com.au': 'AU',
  'next.de': 'DE',
  'next.fr': 'FR',
  'next.es': 'ES',
  'next.nl': 'NL',
  'next.pl': 'PL',
  'next.se': 'SE',
  'next.at': 'AT',
  'next.ch': 'CH',
  'next.be': 'BE',
  'next.dk': 'DK',
  'next.no': 'NO',
  'next.fi': 'FI',
  'next.com': 'US',
};

const CURRENCY_SYMBOL: Record<string, string> = {
  ILS: '₪',
  GBP: '£',
  USD: '$',
  EUR: '€',
  AUD: 'A$',
};

export interface NextMedia {
  name?: string;
  isHeroImage?: boolean;
}

export interface NextPrice {
  currencyCode?: string;
  price?: {
    minPrice?: number;
    maxPrice?: number;
  };
}

export interface NextColourway {
  itemNumber?: string;
  title?: string;
  price?: NextPrice;
}

export interface NextProductSummary {
  title?: string;
  itemNumber?: string;
  media?: NextMedia[];
  colourways?: NextColourway[];
}

export function isNextUrl(url: string): boolean {
  try {
    return NEXT_HOST_PATTERN.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function getNextTerritory(hostname: string): string {
  const normalized = hostname.replace(/^www\./i, '').toLowerCase();
  return TERRITORY_BY_HOST[normalized] ?? 'GB';
}

export function getNextLanguage(pathname: string): string {
  const match = pathname.match(/^\/(en|he|de|fr|es|nl|pl|sv|da|no|fi|it|pt|ar)(?:\/|$)/i);
  return match?.[1]?.toLowerCase() ?? 'en';
}

export function extractNextItemNumber(pathname: string): string | null {
  const match = pathname.match(STYLE_ITEM_PATTERN);
  return match?.[2]?.toUpperCase() ?? null;
}

export function getNextImageUrl(media: NextMedia[] | undefined, itemNumber: string): string | null {
  const hero = media?.find((entry) => entry.isHeroImage && entry.name);
  const imageName = hero?.name ?? media?.find((entry) => entry.name)?.name ?? `${itemNumber}s`;

  return `https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/${imageName}.jpg?im=Resize,width=800`;
}

export function formatNextPrice(price: NextPrice | undefined): string | null {
  const minPrice = price?.price?.minPrice;
  const maxPrice = price?.price?.maxPrice;
  if (minPrice === undefined || maxPrice === undefined) {
    return null;
  }

  const symbol = CURRENCY_SYMBOL[price?.currencyCode ?? ''] ?? `${price?.currencyCode ?? ''} `.trim();
  if (minPrice === maxPrice) {
    return `${symbol}${minPrice}`;
  }

  return `${symbol}${minPrice} - ${symbol}${maxPrice}`;
}

export function findNextColourway<T extends NextColourway>(
  colourways: T[] | undefined,
  itemNumber: string,
): T | undefined {
  return colourways?.find((colourway) => colourway.itemNumber?.toUpperCase() === itemNumber);
}
