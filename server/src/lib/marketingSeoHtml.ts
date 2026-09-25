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

  const canonical =
    payload.path === '/' ? siteUrl.replace(/\/$/, '') : `${siteUrl.replace(/\/$/, '')}${payload.path}`;
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
  result = upsertCanonical(result, canonical);
  result = upsertJsonLd(result, payload.jsonLd);

  return result;
}

export function loadIndexHtmlTemplate(webDist: string): string {
  const indexPath = path.join(webDist, 'index.html');
  return fs.readFileSync(indexPath, 'utf8');
}
