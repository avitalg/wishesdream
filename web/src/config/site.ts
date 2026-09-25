export const SITE_NAME = 'WishGather';
export const SITE_DOMAIN = 'wishgather.com';
export const DEFAULT_SITE_URL = `https://${SITE_DOMAIN}`;
export const SITE_TAGLINE = 'Gift Registry for Every Celebration';
export const DEFAULT_TITLE = `${SITE_NAME} — Gift Registry`;
export const DEFAULT_DESCRIPTION =
  'Create a free gift list and privacy-first gift registry for birthdays, baby showers, weddings, and every celebration. Guests claim gifts anonymously; hosts see who picked what.';

export const SITE_LOCALE = 'en_US';
export const SITE_LANGUAGE = 'en';
export const GEO_REGION = 'US';
export const GEO_PLACENAME = 'United States';

export interface ServiceArea {
  type: 'Country' | 'Place';
  name: string;
  code?: string;
  sameAs: string;
}

/** Regions served — used in structured data for geographic discoverability. */
export const AREA_SERVED: readonly ServiceArea[] = [
  { type: 'Country', name: 'United States', code: 'US', sameAs: 'https://www.wikidata.org/wiki/Q30' },
  { type: 'Country', name: 'United Kingdom', code: 'GB', sameAs: 'https://www.wikidata.org/wiki/Q145' },
  { type: 'Country', name: 'Canada', code: 'CA', sameAs: 'https://www.wikidata.org/wiki/Q16' },
  { type: 'Country', name: 'Australia', code: 'AU', sameAs: 'https://www.wikidata.org/wiki/Q408' },
  { type: 'Country', name: 'Israel', code: 'IL', sameAs: 'https://www.wikidata.org/wiki/Q801' },
  { type: 'Place', name: 'Europe', sameAs: 'https://www.wikidata.org/wiki/Q46' },
];

export function geoForLanguage(language: 'en' | 'he'): { region: string; placename: string } {
  if (language === 'he') {
    return { region: 'IL', placename: 'Israel' };
  }

  return { region: GEO_REGION, placename: GEO_PLACENAME };
}

export const INDEXABLE_PATHS = [
  '/',
  '/how-it-works',
  '/faq',
  '/privacy',
  '/cookies',
  '/gift-registry',
  '/baby-shower-registry',
  '/birthday-wish-list',
  '/blog',
  '/blog/gift-list',
  '/blog/wishlist',
  '/he/blog',
  '/he/blog/gift-list',
  '/he/blog/wishlist',
  '/compare',
] as const;

/** Default Open Graph / Twitter share image (1200×630 recommended). */
export const DEFAULT_OG_IMAGE_PATH = '/og-image.png';

export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
