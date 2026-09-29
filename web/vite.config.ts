/// <reference types="vitest/config" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function assetSource(source: string | Uint8Array): string {
  return typeof source === 'string' ? source : new TextDecoder().decode(source);
}

/** The built stylesheet is small enough to inline, which drops it from the render-blocking request chain. */
function inlineCssPlugin(): Plugin {
  return {
    name: 'inline-render-blocking-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const cssByFile = new Map<string, string>();

      for (const [fileName, item] of Object.entries(bundle)) {
        if (item.type !== 'asset' || !fileName.endsWith('.css')) continue;
        const baseName = fileName.split('/').pop();
        if (!baseName) continue;
        cssByFile.set(baseName, assetSource(item.source));
      }

      if (cssByFile.size === 0) return;

      const consumed = new Set<string>();

      for (const item of Object.values(bundle)) {
        if (item.type !== 'asset' || !item.fileName.endsWith('.html')) continue;

        const html = assetSource(item.source);
        item.source = html.replace(/<link\b[^>]*>/gi, (tag) => {
          if (!/\brel=["']stylesheet["']/i.test(tag)) return tag;
          const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
          const baseName = href?.split('/').pop()?.split('?')[0];
          if (!baseName) return tag;
          const css = cssByFile.get(baseName);
          if (css === undefined) return tag;
          consumed.add(baseName);
          return `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`;
        });
      }

      for (const [fileName, item] of Object.entries(bundle)) {
        if (item.type !== 'asset' || !fileName.endsWith('.css')) continue;
        const baseName = fileName.split('/').pop();
        if (baseName && consumed.has(baseName)) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), inlineCssPlugin()],
  // react-router's package exports resolve to the development build.
  resolve:
    command === 'build'
      ? {
          alias: [
            {
              find: 'react-router/dom',
              replacement: path.resolve(
                rootDir,
                'node_modules/react-router/dist/production/dom-export.mjs',
              ),
            },
            {
              find: 'react-router',
              replacement: path.resolve(
                rootDir,
                'node_modules/react-router/dist/production/index.mjs',
              ),
            },
          ],
        }
      : undefined,
  test: {
    environment: 'node',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3010',
        ws: true,
      },
      '/robots.txt': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
    },
  },
}));
