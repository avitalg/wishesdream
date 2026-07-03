import type { Express, Request, Response } from 'express';

const INDEXABLE_PATHS = ['/', '/how-it-works', '/faq', '/privacy', '/cookies'] as const;

const DISALLOWED_PATHS = ['/dashboard', '/login', '/register', '/lists/'] as const;

function resolveSiteUrl(req: Request): string {
  const configured = process.env.SITE_URL?.replace(/\/$/, '');
  if (configured) {
    return configured;
  }

  const protocol = req.get('x-forwarded-proto') ?? req.protocol;
  const host = req.get('x-forwarded-host') ?? req.get('host');
  return `${protocol}://${host}`;
}

function buildRobotsTxt(siteUrl: string): string {
  const lines = [
    'User-agent: *',
    ...INDEXABLE_PATHS.map((path) => `Allow: ${path === '/' ? '/' : path}`),
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ];

  return `${lines.join('\n')}\n`;
}

function buildSitemapXml(siteUrl: string): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = INDEXABLE_PATHS.map((path) => {
    const loc = path === '/' ? siteUrl : `${siteUrl}${path}`;
    const priority = path === '/' ? '1.0' : '0.8';
    const changefreq = path === '/' ? 'weekly' : 'monthly';

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export function registerSeoRoutes(app: Express): void {
  app.get('/robots.txt', (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    res.type('text/plain').send(buildRobotsTxt(siteUrl));
  });

  app.get('/sitemap.xml', (req, res) => {
    const siteUrl = resolveSiteUrl(req);
    res.type('application/xml').send(buildSitemapXml(siteUrl));
  });
}
