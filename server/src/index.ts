import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer } from 'http';
import authRoutes from './routes/auth.js';
import listRoutes from './routes/lists.js';
import { getWebDistPath, isWebDistAvailable } from './lib/webDistPath.js';
import { wsManager } from './services/websocket.js';
import './db/database.js';
import { isKnownClientRoute } from './lib/seoConfig.js';
import { registerSeoRoutes } from './lib/seoRoutes.js';
import { getSiteUrl } from './lib/envConfig.js';
import {
  injectMarketingSeo,
  loadIndexHtmlTemplate,
} from './lib/marketingSeoHtml.js';
import { isIndexableMarketingPath } from './lib/marketingSeoMeta.js';

function resolveSiteUrl(req: express.Request): string {
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

const app = express();
const PORT = Number(process.env.PORT) || 3010;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);

registerSeoRoutes(app);

if (isWebDistAvailable()) {
  const webDist = getWebDistPath();
  const indexHtmlTemplate = loadIndexHtmlTemplate(webDist);

  app.use(express.static(webDist, { index: false }));

  app.get(/^(?!\/api\/|\/api$|\/ws).*/, (req, res) => {
    const status = isKnownClientRoute(req.path) ? 200 : 404;

    if (status === 200 && isIndexableMarketingPath(req.path)) {
      const siteUrl = resolveSiteUrl(req);
      const html = injectMarketingSeo(indexHtmlTemplate, req.path, siteUrl);
      res.status(status).type('html').send(html);
      return;
    }

    res.status(status).sendFile(path.join(webDist, 'index.html'));
  });

  console.log(`Serving web app from ${webDist}`);
} else if (process.env.NODE_ENV === 'production') {
  console.warn('web/dist not found — run npm run build before npm start');
}

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

const server = createServer(app);
wsManager.attach(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
