import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    plugins: [
        sveltekit()
    ],
    build: {
        outDir: 'dist_svelte',
        target: 'chrome114',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '$lib': resolve(process.cwd(), 'src','renderer','lib')
        }
    }
});

