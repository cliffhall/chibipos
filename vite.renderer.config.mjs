// /Users/cliffhall/Projects/chibipos/vite.renderer.config.mjs
import path from 'path';
import { fileURLToPath } from 'url'; // Import for ES module __dirname equivalent
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

// Define __dirname for ES module scope (this will be the project root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => { // Access mode for conditional base
    return {
        // Set Vite's root to the project root, as svelte.config.js is there
        // and appTemplate (index.html) is also at the root.
        root: __dirname,

        plugins: [
            sveltekit() // SvelteKit will use svelte.config.js from the project root
        ],
        build: {
            // Output directory for the Vite build, relative to the project root
            outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
            emptyOutDir: true,
            rollupOptions: {
                // Explicitly tell Vite to use the index.html at the project root as the input
                input: path.resolve(__dirname, 'index.html')
            }
        },
        server: {
            // When Vite's root is the project root, fs.allow should reflect that.
            fs: {
                allow: [__dirname] // Allow access to the entire project root
            }
        },
        // Set base for correct asset pathing in production builds
        // For development, Vite dev server usually handles this well with '/'
        // For Electron production builds, './' makes paths relative.
        base: mode === 'production' ? './' : '/',

        ssr: {
            noExternal: ['@sveltejs/kit'],
        },
        optimizeDeps: {
            include: ['@sveltejs/kit']
        }
    };
});
