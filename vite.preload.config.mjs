// /Users/cliffhall/Projects/chibipos/vite.preload.config.mjs
import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
    build: {
        // Output directory for the preload script (Electron Forge will place it correctly)
        // outDir: '.vite/build', // Or let Electron Forge manage this fully
        lib: {
            entry: 'src/preload.js', // Path to your preload script
            formats: ['cjs'],
            fileName: () => 'preload.js',
        },
        rollupOptions: {
            external: [
                'electron', // Electron APIs (ipcRenderer, contextBridge)
                ...builtinModules,
                ...builtinModules.map(mod => `node:${mod}`),
                // Add any other specific Node.js modules used ONLY in preload if not covered
            ],
        },
        minify: false, // Or true for production
    },
    ssr: { // Preload scripts are more like Node modules than browser scripts
        target: 'node',
        // noExternal: [], // If you need to bundle specific CJS deps into preload
    },
    // Ensure this path is relative to the project root if preload.js is in src/
    // root: 'src', // Not usually needed if entry is 'src/preload.js'
});
