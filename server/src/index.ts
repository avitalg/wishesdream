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

if (isWebDistAvailable()) {
  const webDist = getWebDistPath();

  app.use(express.static(webDist, { index: false }));

  app.get(/^(?!\/api\/|\/api$|\/ws).*/, (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
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
