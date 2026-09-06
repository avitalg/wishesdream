import { DISALLOWED_PATHS, INDEXABLE_PATHS } from './seoConfig.js';
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
