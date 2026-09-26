import { DISALLOWED_PATHS, INDEXABLE_PATHS } from './seoConfig.js';
import { blogLastmod } from './marketingSeoMeta.js';
import { getSiteUrl } from './envConfig.js';

function resolveSiteUrl(req: import('express').Request): string {
  const configured = getSiteUrl();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SITE_URL is required in production');
  }

  const protocol = req.get('x-forwarded-proto') ?? req.protocol;
  const host = req.get('x-forwarded-host') ?? req.get('host');
  return `${protocol}://${host}`;
}

function buildRobotsTxt(siteUrl: string): string {
  const lines = [
    'User-agent: *',
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ];

  return `${lines.join('\n')}\n`;
}

export function buildSitemapXml(siteUrl: string): string {
  const priorityFor = (path: (typeof INDEXABLE_PATHS)[number]) => {
    if (path === '/') {
      return '1.0';
    }
    if (
      path === '/gift-registry' ||
      path === '/baby-shower-registry' ||
      path === '/birthday-wish-list' ||
      path === '/blog' ||
      path.startsWith('/blog/') ||
      path === '/he/blog' ||
      path.startsWith('/he/blog/') ||
      path === '/compare'
    ) {
      return '0.9';
    }
    return '0.8';
  };

  const urls = INDEXABLE_PATHS.map((path) => {
    const loc = path === '/' ? siteUrl : `${siteUrl}${path}`;
    const priority = priorityFor(path);
    const changefreq = path === '/' ? 'weekly' : 'monthly';
    const alternates = hreflangLinks(siteUrl, path);
    const lastmod = blogLastmod(path);
    const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';

    return `  <url>
    <loc>${loc}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${alternates}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

const BLOG_ENGLISH_PATHS = new Set(['/blog', '/blog/gift-list', '/blog/wishlist']);

function hreflangLinks(siteUrl: string, path: string): string {
  const englishPath = path.startsWith('/he/') ? path.slice(3) : path;
  if (!BLOG_ENGLISH_PATHS.has(englishPath)) {
    return '';
  }

  const englishUrl = `${siteUrl}${englishPath}`;
  const hebrewUrl = `${siteUrl}/he${englishPath}`;

  return `
    <xhtml:link rel="alternate" hreflang="en" href="${englishUrl}" />
    <xhtml:link rel="alternate" hreflang="he" href="${hebrewUrl}" />
    <xhtml:link rel="alternate" hreflang="he-IL" href="${hebrewUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${englishUrl}" />`;
}

export function registerSeoRoutes(app: import('express').Express): void {
  app.get('/robots.txt', (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    res.type('text/plain').send(buildRobotsTxt(siteUrl));
  });

  app.get('/sitemap.xml', (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    res.type('application/xml').send(buildSitemapXml(siteUrl));
  });
}
