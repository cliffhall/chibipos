// /Users/cliffhall/Projects/chibipos/vite.renderer.config.mjs
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendRoot = path.resolve(__dirname, 'frontend');

export default defineConfig({
    root: frontendRoot, // Vite will operate as if CWD is 'frontend'
                        // and will load 'frontend/vite.config.js'
    appType: 'spa',     // Crucial: Hint to SvelteKit plugin via the main Vite instance
    base: '/',
    server: {
        host: true,
        port: 5177,
        strictPort: true, // Good for diagnostics
    },
    plugins: [], // NO sveltekit() plugin here
    resolve: {
        alias: {},
    },
    logLevel: 'info', // Let's try 'info' or 'debug' for more verbosity
    clearScreen: false, // So we don't miss any initial logs
});
