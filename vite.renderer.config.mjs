// /Users/cliffhall/Projects/chibipos/vite.renderer.config.mjs
import path from 'path';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

const rendererRoot = path.resolve(__dirname, 'src/renderer/app');

export default defineConfig({
    root: rendererRoot,
    plugins: [
        sveltekit()
    ],
    build: {
        outDir: path.resolve(__dirname, '.vite/renderer/svelte_kit_build'),
        emptyOutDir: true,
    },
    server: {
        fs: {
            allow: [path.resolve(rendererRoot, '../../..')]
        }
    },
    ssr: {
        noExternal: ['@sveltejs/kit'],
        optimizeDeps: {
            include: ['@sveltejs/kit']
        }
    },
    optimizeDeps: {
        include: ['@sveltejs/kit']
    }
});

