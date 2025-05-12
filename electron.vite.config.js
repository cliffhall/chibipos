// /Users/cliffhall/Projects/chibipos/electron.vite.config.js
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const projectRoot = process.cwd();

export default defineConfig({
  main: {
    // entry: 'src/main/index.js', // Remove: Use build.lib.entry
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(projectRoot, 'dist/electron/main'),
      emptyOutDir: true,
      lib: {
        entry: 'src/main/index.js', // Define entry here
        formats: ['es'],
        fileName: () => 'index.js'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  preload: {
    // entry: 'src/preload.js', // Remove: Use build.lib.entry
    // root: resolve(projectRoot, 'dist_svelte/build_output'), // REMOVE THIS LINE
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(projectRoot, 'dist/electron/preload'),
      emptyOutDir: true,
      lib: {
        entry: 'src/preload.js',
        formats: ['es'], // Keep as 'es' for now, or try 'cjs' if 'es' still fails
        fileName: () => 'preload.js'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    root: resolve(projectRoot, 'dist_svelte/build_output'),
    build: {
      target: 'chrome114',
      outDir: resolve(projectRoot, 'dist/electron/renderer'),
      emptyOutDir: true,
      rollupOptions: {
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
