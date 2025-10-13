import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // Maps @/ to src/
            '@shared': path.resolve(__dirname, '../shared'), // Maps @shared/ to root shared folder
            // '@assets' hata diya kyunki ab images public/assets mein hain
        },
    },
    base: '/', // Ensure correct base URL for Vercel
    publicDir: 'public', // Explicitly set public folder for static assets
    build: {
        assetsDir: 'assets', // Output imported assets to /assets/ in dist
        outDir: 'dist', // Default output directory
    },
});