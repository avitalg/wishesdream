/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
});
