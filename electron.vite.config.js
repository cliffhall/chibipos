// /Users/cliffhall/Projects/chibipos/electron.vite.config.js
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
// sveltekit plugin is not needed here for the build if we pre-build SvelteKit
// import { sveltekit } from '@sveltejs/kit/vite';

const projectRoot = process.cwd();

export default defineConfig({
  main: {
    entry: 'src/main/index.js',
    plugins: [
      externalizeDepsPlugin()
    ],
    build: {
      outDir: 'dist/electron/main',
      emptyOutDir: true,
      lib: {
        formats: ['es'],
        fileName: () => 'main.js'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  preload: {
    entry: 'src/preload.js',
    plugins: [
      externalizeDepsPlugin()
    ],
    build: {
      outDir: 'dist/electron/preload',
      emptyOutDir: true,
      lib: {
        entry: 'src/preload.js',
        formats: ['cjs'],
        fileName: () => 'preload.js'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    // root: projectRoot, // Optional, electron-vite resolves input relative to project root
    // plugins: [], // sveltekit() plugin is not used in this build strategy
    build: {
      target: 'chrome114', // For Electron 35
      outDir: 'dist/electron/renderer',
      emptyOutDir: true,
      rollupOptions: {
        // This tells electron-vite to take the already built SvelteKit app
        // from `dist_svelte` and package it as the renderer.
        input: resolve(projectRoot, 'dist_svelte/build_output/index.html')
      }
    },
    resolve: {
      alias: {
        // This alias might still be useful if any paths are resolved
        // during electron-vite's processing of the pre-built HTML.
        '$lib': resolve(projectRoot, 'src/renderer/app/lib')
      }
    },
    server: {
      // This server config is for `electron-vite dev`.
      // For this two-step build strategy to work in dev, you'd typically
      // run the SvelteKit dev server separately and point Electron to its URL,
      // or use a conditional configuration in electron-vite to use sveltekit() plugin for dev.
      // Let's focus on getting the production build working first.
      fs: {
        allow: ['.', 'src', 'dist_svelte'] // Might need to allow serving from dist_svelte in dev
      }
    }
  }
});
