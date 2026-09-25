import fs from 'fs';
import path from 'path';
import { getDefaultOgImageAlt, getMarketingSeoPayload } from './marketingSeoMeta.js';

const JSON_LD_SCRIPT_ID = 'server-marketing-jsonld';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceMetaContent(html: string, attribute: 'name' | 'property', key: string, content: string): string {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(
    `(<meta\\s+${attribute}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content=")([^"]*)(")`,
    'i',
  );

  if (pattern.test(html)) {
    return html.replace(pattern, `$1${escaped}$3`);
  }

  const tag = `<meta ${attribute}="${key}" content="${escaped}" />`;
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function replaceTitle(html: string, title: string): string {
  const escaped = escapeHtml(title);
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escaped}</title>`);
}

function upsertCanonical(html: string, href: string): string {
  const escaped = escapeHtml(href);
  const linkPattern = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;

  if (linkPattern.test(html)) {
    return html.replace(linkPattern, `<link rel="canonical" href="${escaped}" />`);
  }

  return html.replace('</head>', `    <link rel="canonical" href="${escaped}" />\n  </head>`);
}

function upsertJsonLd(html: string, jsonLd: Record<string, unknown>): string {
  const scriptBody = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
  const script = `<script id="${JSON_LD_SCRIPT_ID}" type="application/ld+json">${scriptBody}</script>`;
  const withoutExisting = html.replace(
    new RegExp(`<script\\s+id="${JSON_LD_SCRIPT_ID}"[^>]*>[\\s\\S]*?<\\/script>\\s*`, 'i'),
    '',
  );

  return withoutExisting.replace('</head>', `    ${script}\n  </head>`);
}

function absoluteOgImage(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, '')}/og-image.png`;
}

export function injectMarketingSeo(html: string, pathname: string, siteUrl: string): string {
  const payload = getMarketingSeoPayload(pathname, siteUrl);
  if (!payload) {
    return html;
  }

  const siteOrigin = siteUrl.replace(/\/$/, '');
  const canonical = payload.path === '/' ? siteOrigin : `${siteOrigin}${payload.path}`;
  const imageUrl = absoluteOgImage(siteUrl);
  const imageAlt = getDefaultOgImageAlt();

  let result = replaceTitle(html, payload.pageTitle);
  result = replaceMetaContent(result, 'name', 'description', payload.description);
  result = replaceMetaContent(result, 'property', 'og:title', payload.pageTitle);
  result = replaceMetaContent(result, 'property', 'og:description', payload.description);
  result = replaceMetaContent(result, 'property', 'og:url', canonical);
  result = replaceMetaContent(result, 'property', 'og:image', imageUrl);
  result = replaceMetaContent(result, 'property', 'og:image:alt', imageAlt);
  result = replaceMetaContent(result, 'name', 'twitter:title', payload.pageTitle);
  result = replaceMetaContent(result, 'name', 'twitter:description', payload.description);
  result = replaceMetaContent(result, 'name', 'twitter:image', imageUrl);
  result = replaceMetaContent(result, 'name', 'twitter:image:alt', imageAlt);
  result = replaceMetaContent(result, 'name', 'geo.region', payload.geo.region);
  result = replaceMetaContent(result, 'name', 'geo.placename', payload.geo.placename);
  result = upsertCanonical(result, canonical);
  result = upsertHreflang(result, siteOrigin, payload.alternates);
  result = upsertJsonLd(result, payload.jsonLd);

  if (payload.language === 'he') {
    result = result.replace('<html lang="en">', '<html lang="he" dir="rtl">');
    result = replaceMetaContent(result, 'name', 'language', 'he');
    result = replaceMetaContent(result, 'property', 'og:locale', 'he_IL');
    result = replaceMetaContent(result, 'property', 'og:locale:alternate', 'en_US');
  }

  if (payload.bodyHtml) {
    result = result.replace('<div id="root"></div>', `<div id="root">${payload.bodyHtml}</div>`);
  }

  return result;
}

function upsertHreflang(
  html: string,
  siteOrigin: string,
  alternates: Array<{ hreflang: string; path: string }> | undefined,
): string {
  const withoutExisting = html.replace(
    /\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/gi,
    '',
  );
  if (!alternates || alternates.length === 0) {
    return withoutExisting;
  }

  const links = alternates
    .map((alternate) => {
      const href = alternate.path === '/' ? siteOrigin : `${siteOrigin}${alternate.path}`;
      return `<link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeHtml(href)}" />`;
    })
    .join('\n    ');

  return withoutExisting.replace('</head>', `    ${links}\n  </head>`);
}

export function loadIndexHtmlTemplate(webDist: string): string {
  const indexPath = path.join(webDist, 'index.html');
  return fs.readFileSync(indexPath, 'utf8');
}
