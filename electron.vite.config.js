// /Users/cliffhall/Projects/chibipos/electron.vite.config.js
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const projectRoot = process.cwd();

export default defineConfig({
  // ... (main and preload sections remain the same)
  renderer: {
    root: resolve(projectRoot, 'dist_svelte/build_output'),
    base: './', // Keep this for Electron asset pathing if Step 1 showed it wasn't the direct cause of this specific error
    build: {
      target: 'chrome114',
      outDir: resolve(projectRoot, 'dist/electron/renderer'),
      emptyOutDir: true,
      rollupOptions: {
        // Use an absolute path for input, still within the defined 'root'
        input: resolve(projectRoot, 'dist_svelte/build_output/index.html')
      }
    },
    resolve: {
      alias: {
        '$lib': resolve(projectRoot, 'src/renderer/app/lib')
      }
    },
    server: {
      fs: {
        allow: ['.', 'src', resolve(projectRoot, 'dist_svelte/build_output')]
      }
    }
  }
});
