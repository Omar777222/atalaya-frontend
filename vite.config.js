import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En local, Vite reenvía /api al backend (en AWS lo hace Nginx).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
