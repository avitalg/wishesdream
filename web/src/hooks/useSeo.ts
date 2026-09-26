import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  absoluteUrl,
  geoForLanguage,
} from '../config/site.js';
import { applyDocumentLanguage, getAlternateOgLocale, getOgLocale } from '../i18n/index.js';
import { buildJsonLdGraph } from '../lib/seoJsonLd.js';

export interface SeoAlternate {
  hreflang: string;
  path: string;
}

export interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  language?: 'en' | 'he';
  alternates?: SeoAlternate[];
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const JSON_LD_ID = 'wishgather-jsonld';
const SERVER_JSON_LD_ID = 'server-marketing-jsonld';

function removeMeta(attribute: 'name' | 'property', key: string): void {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

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

function setHreflangLinks(alternates: SeoAlternate[] | undefined): void {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((element) => element.remove());

  if (!alternates) {
    return;
  }

  for (const alternate of alternates) {
    const element = document.createElement('link');
    element.rel = 'alternate';
    element.hreflang = alternate.hreflang;
    element.href = absoluteUrl(alternate.path);
    document.head.appendChild(element);
  }
}

function setJsonLd(data: SeoOptions['jsonLd']): void {
  const existing = document.getElementById(JSON_LD_ID);
  existing?.remove();

  if (!data) {
    return;
  }

  document.getElementById(SERVER_JSON_LD_ID)?.remove();

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
  language: languageOverride,
  alternates,
  jsonLd,
}: SeoOptions = {}): void {
  const { t, i18n } = useTranslation();
  const jsonLdSerialized = jsonLd ? JSON.stringify(jsonLd) : '';
  const alternatesSerialized = alternates ? JSON.stringify(alternates) : '';
  const language = languageOverride ?? (i18n.language.startsWith('he') ? 'he' : 'en');

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

    applyDocumentLanguage(language);
    document.title = pageTitle;

    const geo = geoForLanguage(language);

    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta('name', 'robots', robots);
    if (geo) {
      upsertMeta('name', 'geo.region', geo.region);
      upsertMeta('name', 'geo.placename', geo.placename);
    } else {
      removeMeta('name', 'geo.region');
      removeMeta('name', 'geo.placename');
    }
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
    setHreflangLinks(
      alternatesSerialized
        ? (JSON.parse(alternatesSerialized) as SeoAlternate[])
        : undefined,
    );

    setJsonLd(parsedJsonLd);

    return () => {
      document.getElementById(JSON_LD_ID)?.remove();
    };
  }, [title, description, path, noindex, type, image, imageAlt, jsonLdSerialized, alternatesSerialized, t, language]);
}
