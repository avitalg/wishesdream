export const SITE_NAME = 'WishesDream';
export const SITE_TAGLINE = 'Gift Registry for Every Celebration';
export const DEFAULT_TITLE = `${SITE_NAME} — Gift Registry`;
export const DEFAULT_DESCRIPTION =
  'Create a free, privacy-first gift registry for birthdays, baby showers, weddings, and every celebration. Guests claim gifts anonymously; hosts see who picked what.';

export const SITE_LOCALE = 'en_US';
export const SITE_LANGUAGE = 'en';
export const GEO_REGION = 'US';
export const GEO_PLACENAME = 'United States';

/** Regions served — used in structured data for geographic discoverability. */
export const AREA_SERVED = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Israel',
  'Europe',
] as const;

export const INDEXABLE_PATHS = [
  '/',
  '/how-it-works',
  '/faq',
  '/privacy',
  '/cookies',
] as const;

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
