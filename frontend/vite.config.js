import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forwards any /api/* request from the dev server to the backend,
    // so the frontend can just call fetch('/api/...') with no CORS setup needed.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
