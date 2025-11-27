import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Relative base path for static hosting
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
