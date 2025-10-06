// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// 1. Zaroori modules import karein
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// 2. __dirname aur __filename ka ESM equivalent define karein
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined
      ? [
        // Yahan 'await' ya .then() ka istemal theek hai kyunki yeh ek async operation hai
        import('@replit/vite-plugin-cartographer').then((m) =>
          m.cartographer(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      // 3. Ab __dirname theek se kaam karega
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  root: path.resolve(__dirname, 'client'), // Ab theek hai
  build: {
    outDir: path.resolve(__dirname, 'dist/public'), // Ab theek hai
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // FIXED: Backend port 5000 pe
        changeOrigin: true,
        secure: false,  // Local dev ke liye (optional, add kiya safety ke liye)
        // FIXED: Rewrite remove kiya – ab /api/* direct backend /api/* pe jayega
      },
    },
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
});