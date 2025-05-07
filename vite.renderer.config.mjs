// vite.renderer.config.mjs
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte'; // Import Svelte plugin
import path from 'path';

const rendererRoot = path.resolve(__dirname, 'src/renderer');

export default defineConfig({
    root: rendererRoot, // Vite project root is src/renderer
    plugins: [
        svelte({
            // Path to your svelte.config.js, relative to this Vite config's root
            // or an absolute path.
            // Since vite.renderer.config.mjs is in the project root,
            // and svelte.config.js is now in src/renderer/
            configFile: path.resolve(rendererRoot, 'svelte.config.js'),
        }),
    ],
    // ... other Electron Forge Vite plugin settings ...
    build: {
        outDir: path.resolve(__dirname, '.vite/renderer'), // Standard Electron Forge output
        // ...
    },
    // publicDir: 'public', // This is relative to the `root` (src/renderer)
    // So it will look for src/renderer/public
});

