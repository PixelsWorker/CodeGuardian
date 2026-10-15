/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolveServerNetworkConfig } from './src/utils/serverConfig';

export { resolveServerNetworkConfig };

export const trustedPreviewHosts = [
  'localhost',
  '127.0.0.1',
  'ais-dev-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
  'ais-pre-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
  '.asia-northeast1.run.app',
];

const serverConfig = resolveServerNetworkConfig(process.env);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: serverConfig.host,
    port: serverConfig.port,
    allowedHosts: trustedPreviewHosts,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
