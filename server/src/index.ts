import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import authRoutes from './routes/auth.js';
import listRoutes from './routes/lists.js';
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
