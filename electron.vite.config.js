// /Users/cliffhall/Projects/chibipos/electron.vite.config.js
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const projectRoot = process.cwd();

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(projectRoot, 'dist/electron/main'),
      emptyOutDir: true,
      lib: {
        entry: 'src/main/index.js',
        formats: ['es'],
        fileName: () => 'index.js'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(projectRoot, 'dist/electron/preload'),
      emptyOutDir: true,
      lib: {
        entry: 'src/preload.js',
        formats: ['cjs'],
        fileName: () => 'preload.cjs'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    // For the build, the root is where the SvelteKit output is.
    // electron-vite build will take input from here.
    root: resolve(projectRoot, 'dist_svelte/build_output'),
    build: {
      base: './',
      target: 'chrome114',
      outDir: resolve(projectRoot, 'dist/electron/renderer'),
      emptyOutDir: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        // Input is index.html from SvelteKit's build output,
        // relative to the `root` defined above.
        input: resolve(projectRoot, 'dist_svelte/build_output/index.html'),
        output: {
          // Consistent naming for relative paths
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      }
    },
    resolve: {
      alias: {
        '$lib': resolve(projectRoot, 'src/renderer/app/lib')
      }
    },
    server: { // This is for dev server, not directly related to build issue
      fs: {
        allow: ['.', 'src', resolve(projectRoot, 'dist_svelte/build_output')]
      }
    }
  }
});
