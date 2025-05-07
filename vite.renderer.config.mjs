// vite.renderer.config.mjs
import path from 'path';
import { defineConfig } from 'vite';
import commonjs from '@rollup/plugin-commonjs';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Change this line:
const rendererRoot = path.resolve(__dirname, 'src/renderer/app'); // <-- Point to the 'app' subdirectory

export default defineConfig({
    root: rendererRoot, // Vite project root is now src/renderer/app
    plugins: [
        svelte({
            // If svelte.config.mjs is in src/renderer, you might need to adjust this path
            // or ensure it's correctly resolved from the new root.
            // If svelte.config.mjs is in src/renderer/app, this might be:
            // configFile: path.resolve(rendererRoot, 'svelte.config.mjs'),
            // Or if it's still in src/renderer:
            configFile: path.resolve(__dirname, 'src/renderer/svelte.config.mjs'),
        }),
        commonjs({
            include: [
                /node_modules\/sequelize/,
            ],
            transformMixedEsModules: true,
            interop: 'default',
            requireReturnsDefault: 'auto',
        }),
    ],
    build: {
        // The output directory is relative to the project root, not this config file's location.
        // So, '.vite/renderer' will be created at the top level of your project.
        outDir: path.resolve(__dirname, '.vite/renderer'),
    },
    optimizeDeps: {
        include: ['sequelize'],
    },
});

