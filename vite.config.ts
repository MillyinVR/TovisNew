import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      // Add any CSS preprocessor options if needed
    },
  },
  optimizeDeps: {
    include: ['mapbox-gl'],
  },
  build: {
    commonjsOptions: {
      include: [/mapbox-gl/, /node_modules/],
    },
  },
});