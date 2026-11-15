import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
    target: 'esnext',
    chunkSizeWarningLimit: 1500
  }
});
