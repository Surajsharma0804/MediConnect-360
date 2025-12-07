import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { pwaConfig } from './vite-pwa.config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pwaConfig],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'recharts'],
          'auth-vendor': ['@react-oauth/google', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
