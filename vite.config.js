import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api, /uploads and /socket.io to the Express backend so
// cookies stay first-party during development. In production the SPA is
// deployed on its own host and talks to the backend through VITE_API_URL.
const backend = process.env.BACKEND_ORIGIN || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/uploads': { target: backend, changeOrigin: true },
      '/socket.io': { target: backend, ws: true },
    },
  },
});
