// /Users/cliffhall/Projects/chibipos/vite.renderer.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This is your project root

export default defineConfig(({ mode }) => {
    return {
        root: __dirname, // Correct: SvelteKit expects Vite root to be project root
        plugins: [
            sveltekit() // This plugin handles the SvelteKit build
        ],
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        build: {
            // This should align with your svelte.config.js adapter output
            outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
            emptyOutDir: true, // This is generally good to ensure a clean build directory
            // manifest: true, // Let SvelteKit handle its own manifest needs. Remove or comment out.
            // rollupOptions: { // Remove or comment out this section
            //     // The sveltekit() plugin should handle the input based on your SvelteKit config.
            //     // input: path.resolve(__dirname, 'index.html')
            // }
        },
        base: mode === 'production' ? './' : '/', // Crucial for final asset paths in Electron
        server: {
            fs: {
                allow: [__dirname] // Good for development server
            }
        },
        ssr: {
            // Ensures SvelteKit's client-side router and other parts are bundled
            noExternal: ['@sveltejs/kit'],
        },
        optimizeDeps: {
            include: ['@sveltejs/kit'] // Helps Vite pre-bundle SvelteKit
        }
    };
});
