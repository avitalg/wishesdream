# WishesDream — Gift Registry

A privacy-conscious collaborative gift registry for birthdays, baby showers, weddings, and other celebrations. Hosts import product links, guests claim items anonymously, and real-time updates keep everyone in sync.

## Features

- **Role-based visibility** — Guests see only Available / Already Selected; hosts see full claimer names
- **Guest self-management** — Browser session token lets guests unclaim their own selections
- **Smart URL import** — Paste product links to auto-fetch title, image, and price
- **Real-time sync** — WebSocket updates when items are claimed or unclaimed
- **Concurrency-safe claims** — SQLite row locking prevents double-claims

## Requirements

- Node.js 20+ (see [`.nvmrc`](.nvmrc))

## Quick Start

```bash
git clone <your-repo-url>
cd wishesdream

# Installs root, server, and web dependencies (via postinstall)
npm install

# Run both server (port 3010) and web (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production

```bash
npm run build
npm start
```

Open [http://localhost:3010](http://localhost:3010) (or your configured `PORT`). Express serves the built React app and API on a single port.

Development (`npm run dev`) still uses Vite on port 5173 with API/WebSocket proxied to 3010.

## Railway deployment

Use the **repo root** as the service root (do not set Root Directory to `server/`).

[`railway.json`](railway.json) configures:

| Step | Command |
|------|---------|
| Build | `npm run build` (compiles server + `web/dist`) |
| Start | `node server/dist/index.js` |

Required variables in Railway:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Long random string |
| `SITE_URL` | Your public app URL (e.g. `https://your-app.up.railway.app`) |
| `DATABASE_PATH` | `/data/wishesdream.db` (with a Volume mounted at `/data`) |

After deploy, logs should include `Serving web app from .../web/dist`. If you see `Cannot GET /`, the build did not produce `web/dist` or static serving code is missing.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + frontend in development |
| `npm test` | Run server and web test suites |
| `npm run build` | Compile server and web for production |
| `npm start` | Start the server (API + built web app in production) |

## Project Structure

```
server/          Express + SQLite API, WebSocket, URL parser
web/             React + Vite frontend
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Create host account |
| `POST /api/auth/login` | Host login |
| `GET /api/lists/:id` | Get list (RBAC-filtered payload) |
| `POST /api/lists/:id/claim` | Claim an item |
| `DELETE /api/lists/:id/claim/:itemId` | Unclaim an item |
| `GET /api/lists/:id/export` | Export full claim data (host only) |

Guest identity is passed via the `X-Guest-Token` header (stored in `localStorage` after claiming).

## Environment

Copy [`.env.example`](.env.example) to `.env` and adjust as needed. Variables are read by the server process.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3010` | Server port |
| `JWT_SECRET` | dev default | JWT signing secret — **must be set in production** |
| `DATABASE_PATH` | `server/data/wishesdream.db` | SQLite database file |
| `SCRAPERAPI_KEY` | — | Optional Amazon import fallback |
| `MICROLINK_API_KEY` | — | Optional Amazon metadata fallback |
| `WEB_DIST_PATH` | `web/dist` | Path to built frontend (relative to repo root by default) |

## CI

GitHub Actions runs `npm test` and `npm run build` on push/PR to `main` or `master` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## License

[MIT](LICENSE)
