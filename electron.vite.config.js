// /Users/cliffhall/Projects/chibipos/electron.vite.config.js
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const projectRoot = process.cwd();

export default defineConfig({
  main: {
    // ... (your main config)
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
    // ... (your preload config)
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
    root: resolve(projectRoot, 'dist_svelte/build_output'), // Source of SvelteKit's build
    build: {
      // Explicitly set base. electron-vite should default to '' for prod,
      // but './' is often more robust for file:// protocols.
      base: './',
      target: 'chrome114', // Keep this
      outDir: resolve(projectRoot, 'dist/electron/renderer'), // Final destination
      emptyOutDir: true,
      // Try to prevent inlining to see if it isolates the path issue
      // If this helps, the problem is definitely with how Vite rewrites paths during inlining.
      assetsInlineLimit: 0, // Set to 0 to disable inlining of assets like JS/CSS into data URIs
      rollupOptions: {
        input: resolve(projectRoot, 'dist_svelte/build_output/index.html'),
        output: {
          // This ensures that even dynamic imports use relative paths
          // Might be redundant if `base: './'` works as expected, but good to have.
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
