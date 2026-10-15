/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolveServerNetworkConfig } from './src/utils/serverConfig';

export { resolveServerNetworkConfig };

const serverConfig = resolveServerNetworkConfig(process.env);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: serverConfig.host,
    port: serverConfig.port,
    allowedHosts: serverConfig.allowedHosts,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
