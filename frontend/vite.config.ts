/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  // ===============================================
  // Server (local dev)
  // ===============================================
  server: {
    host: true,                 // Listen on all addresses (0.0.0.0)
    port: 3000,
    open: true,                 // auto-open browser on dev start
    proxy: {
      // Proxy API calls during development (avoids CORS issues)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy auth callbacks if testing locally (matches backend route /auth/fayda/callback)
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying /auth request to backend:', req.method, req.url);
          });
        },
      },
    },
  },

  // ===============================================
  // Path aliases (cleaner imports)
  // ===============================================
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },

  // ===============================================
  // Vitest testing config
  // ===============================================
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },

  // ===============================================
  // Build optimizations
  // ===============================================
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});