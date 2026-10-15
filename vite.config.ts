/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Detect whether running in container / AI Studio cloud preview environment
const isPreviewEnv = Boolean(
  process.env.K_SERVICE ||
  process.env.AIS_APPLET_ID ||
  process.env.PORT ||
  process.env.CONTAINER_ID ||
  process.env.NODE_ENV === 'production'
);

// Specific trusted preview hostnames for this AI Studio project
const trustedPreviewHosts = [
  'localhost',
  '127.0.0.1',
  'ais-dev-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
  'ais-pre-x2tg3lcsmgot7hyie7bj66-711888545375.asia-northeast1.run.app',
];

if (process.env.AIS_APPLET_HOST) {
  trustedPreviewHosts.push(process.env.AIS_APPLET_HOST);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // For local development, bind only to 127.0.0.1.
    // In Google AI Studio preview containers, bind to 0.0.0.0 to allow container ingress.
    host: isPreviewEnv ? '0.0.0.0' : '127.0.0.1',
    port: 3000,
    // Explicit trusted-host allowlist targeting the exact project preview hostnames
    allowedHosts: trustedPreviewHosts,
  },
  // Vitest configuration for component integration testing with jsdom
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
