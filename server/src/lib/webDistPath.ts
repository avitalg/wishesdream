import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultWebDistPath = path.resolve(__dirname, '../../../web/dist');

export function getWebDistPath(): string {
  return process.env.WEB_DIST_PATH
    ? path.resolve(process.env.WEB_DIST_PATH)
    : defaultWebDistPath;
}

export function isWebDistAvailable(): boolean {
  const webDist = getWebDistPath();
  return fs.existsSync(webDist) && fs.existsSync(path.join(webDist, 'index.html'));
}
