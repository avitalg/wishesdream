import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GEO_PLACENAME, GEO_REGION, SITE_NAME, absoluteUrl } from '../config/site.js';
import { getOgLocale } from '../i18n/index.js';

export interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const JSON_LD_ID = 'wishesdream-jsonld';
const HREFLANGS = ['en', 'he'] as const;

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

function upsertHreflang(lang: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${lang}"]`,
  );

  if (!element) {
    element = document.createElement('link');
    element.rel = 'alternate';
    document.head.appendChild(element);
  }

  element.href = href;
  element.hreflang = lang;
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

function setJsonLd(data: SeoOptions['jsonLd']): void {
  const existing = document.getElementById(JSON_LD_ID);
  existing?.remove();

  if (!data) {
    return;
  }

  const script = document.createElement('script');
  script.id = JSON_LD_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function useSeo({
  title,
  description,
  path = '/',
  noindex = false,
  type = 'website',
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
    upsertMeta('property', 'og:url', canonical);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);

    upsertLink('canonical', canonical);
    for (const hreflang of HREFLANGS) {
      upsertHreflang(hreflang, canonical);
    }
    upsertHreflang('x-default', canonical);

    setJsonLd(parsedJsonLd);

    return () => {
      document.getElementById(JSON_LD_ID)?.remove();
    };
  }, [title, description, path, noindex, type, jsonLdSerialized, t, language]);
}
