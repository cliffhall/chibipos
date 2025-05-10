// /Users/cliffhall/Projects/chibipos/vite.renderer.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    return {
        root: __dirname,
        plugins: [
            sveltekit()
        ],
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        build: {
            outDir: path.resolve(__dirname, '.vite/renderer/main_window'),
            emptyOutDir: true,
            manifest: true,
        },
        base: mode === 'production' ? './' : '/', // Crucial for final asset paths in Electron
        server: {
            host: '127.0.0.1',
            port: 5173,
            fs: {
                allow: [__dirname]
            }
        },
        ssr: {
            noExternal: ['@sveltejs/kit'],
        },
        optimizeDeps: {
            include: ['@sveltejs/kit']
        }
    };
});
