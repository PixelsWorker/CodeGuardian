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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // For local development, bind only to 127.0.0.1.
    // In Google AI Studio preview containers, bind to 0.0.0.0 to allow container ingress.
    host: isPreviewEnv ? '0.0.0.0' : '127.0.0.1',
    port: 3000,
    // Explicit trusted-host allowlist instead of wildcard host acceptance
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.run.app',
      '.asia-northeast1.run.app',
    ],
  },
});
