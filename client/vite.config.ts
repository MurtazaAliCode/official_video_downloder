import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // Maps @/ to src/
            '@shared': path.resolve(__dirname, '../shared'), // Maps @shared/ to root shared folder
            '@assets': path.resolve(__dirname, './src/assets'), // Maps @assets/ to src/assets/
        },
    },
    base: '/', // Ensure correct base URL for Vercel
    build: {
        assetsDir: 'assets', // Output assets to /assets/ in dist
    },
});