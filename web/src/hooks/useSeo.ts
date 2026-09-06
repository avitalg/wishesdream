import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_OG_IMAGE_PATH,
  GEO_PLACENAME,
  GEO_REGION,
  SITE_NAME,
  absoluteUrl,
} from '../config/site.js';
import { getAlternateOgLocale, getOgLocale } from '../i18n/index.js';
import { buildJsonLdGraph } from '../lib/seoJsonLd.js';

export interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const JSON_LD_ID = 'wishesdream-jsonld';

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

function removeHreflangLinks(): void {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((element) => element.remove());
}

function setJsonLd(data: SeoOptions['jsonLd']): void {
  const existing = document.getElementById(JSON_LD_ID);
  existing?.remove();

  if (!data) {
    return;
  }

  const normalized = Array.isArray(data) ? buildJsonLdGraph(data) : data;

  const script = document.createElement('script');
  script.id = JSON_LD_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(normalized);
  document.head.appendChild(script);
}

export function useSeo({
  title,
  description,
  path = '/',
  noindex = false,
  type = 'website',
  image,
  imageAlt,
  jsonLd,
}: SeoOptions = {}): void {
  const { t, i18n } = useTranslation();
  const jsonLdSerialized = jsonLd ? JSON.stringify(jsonLd) : '';
  const language = i18n.language.startsWith('he') ? 'he' : 'en';

  useEffect(() => {
    const resolvedDescription = description ?? t('seo.defaultDescription');
    const resolvedTitle = title ?? t('seo.defaultTitle');
    const pageTitle = `${resolvedTitle} — ${SITE_NAME}`;
    const canonical = absoluteUrl(path);
    const robots = noindex ? 'noindex, nofollow' : 'index, follow';
    const imagePath = image ?? DEFAULT_OG_IMAGE_PATH;
    const imageUrl = imagePath.startsWith('http') ? imagePath : absoluteUrl(imagePath);
    const resolvedImageAlt = imageAlt ?? t('seo.defaultImageAlt');
    const parsedJsonLd = jsonLdSerialized
      ? (JSON.parse(jsonLdSerialized) as SeoOptions['jsonLd'])
      : undefined;

    document.title = pageTitle;

    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'geo.region', GEO_REGION);
    upsertMeta('name', 'geo.placename', GEO_PLACENAME);
    upsertMeta('name', 'language', language);

    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', getOgLocale(language));
    upsertMeta('property', 'og:locale:alternate', getAlternateOgLocale(language));
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:alt', resolvedImageAlt);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertMeta('name', 'twitter:image:alt', resolvedImageAlt);

    upsertLink('canonical', canonical);
    removeHreflangLinks();

    setJsonLd(parsedJsonLd);

    return () => {
      document.getElementById(JSON_LD_ID)?.remove();
    };
  }, [title, description, path, noindex, type, image, imageAlt, jsonLdSerialized, t, language]);
}
