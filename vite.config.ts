import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Build options
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },

  // Server options
  server: {
    port: 5173,
    host: true,
  },
});
