import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-default-data',
      writeBundle() {
        // copy default.json to dist/assets for Electron to access
        try {
          mkdirSync('dist/assets', { recursive: true });
          copyFileSync('src/data/default.json', 'dist/assets/default.json');
          console.log('Copied default.json to dist/assets/');
        } catch (error) {
          console.error('Failed to copy default.json:', error);
        }
      }
    }
  ],
  base: './',
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});


