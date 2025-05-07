// vite.renderer.config.mjs
import path from 'path';
import { defineConfig } from 'vite';
import commonjs from '@rollup/plugin-commonjs';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const rendererRoot = path.resolve(__dirname, 'src/renderer');

export default defineConfig({
    root: rendererRoot, // Vite project root is src/renderer
    plugins: [
        svelte({
            configFile: path.resolve(rendererRoot, 'svelte.config.mjs'),
        }),
        commonjs({
            include: [
                /node_modules\/sequelize/,
                // Add other CJS dependencies here if they cause issues
            ],
            transformMixedEsModules: true,
            interop: 'default', // Keep this, as it's designed for module.exports.default
            // This option can help when a CJS module's require() should yield a default export.
            // 'auto' will try to heuristically determine this. 'true' is more assertive.
            requireReturnsDefault: 'auto',
        }),
    ],
    build: {
        outDir: path.resolve(__dirname, '.vite/renderer'),
    },
    // Explicitly tell Vite to pre-bundle sequelize.
    // This can often help resolve CJS/ESM interop issues as Vite's esbuild-based
    // pre-bundling is quite good at converting CJS to ESM.
    optimizeDeps: {
        include: ['sequelize'],
    },
});
