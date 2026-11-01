import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En local, Vite reenvía /api al backend (en AWS lo hace Nginx).
// 127.0.0.1 y no "localhost": en Windows con Node 18+ localhost se resuelve a ::1 (IPv6) y la API escucha en IPv4.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true },
    },
  },
});
