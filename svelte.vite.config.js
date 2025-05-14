// /Users/cliffhall/Projects/chibipos/vite.svelte_test.config.js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    plugins: [
        sveltekit()
    ],
    build: {
        // Use a distinct output directory for this test to avoid conflicts
        outDir: 'dist_svelte',
        // Set the target matching your Electron version's Chromium
        // For Electron 35.x, Chromium is ~114.
        // Your electron.vite.config.js has 'chrome*', which is likely a typo.
        target: 'chrome114',
        emptyOutDir: true,
    },
    // Include any aliases your SvelteKit code might need during its build
    resolve: {
        alias: {
            // Assuming this alias is used within your SvelteKit components/modules
            '$lib': resolve(process.cwd(), 'src/renderer/app/lib')
        }
    }
});

