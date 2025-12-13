import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { pwaConfig } from './vite-pwa.config'; // Temporarily disabled for faster builds

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // PWA temporarily disabled
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
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
    sourcemap: false, // Disable sourcemaps for faster builds
  },
});
