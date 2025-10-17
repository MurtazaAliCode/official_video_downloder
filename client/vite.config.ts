import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Maps @/ to client/src/
      '@shared': path.resolve(__dirname, '../shared'), // Maps @shared/ to root shared folder
    },
  },
  base: '/', // Base URL for Vercel deployment
  publicDir: 'public', // Static assets from client/public/
  build: {
    outDir: 'dist', // Output directory
    assetsDir: 'assets', // Output assets to dist/assets/
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/index.html'), // Explicitly set input file
      },
    },
  },
});