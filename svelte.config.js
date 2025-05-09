// /Users/cliffhall/Projects/chibipos/svelte.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This is your project root

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			// Align adapter output with Electron Forge's expected renderer path
			pages: '.vite/renderer/main_window',    // Output HTML files here
			assets: '.vite/renderer/main_window',   // Output static assets from kit.files.assets here
			fallback: 'index.html', // Will create .vite/renderer/main_window/index.html
			precompress: false,
			strict: true,
			rollupConfig: {
				output: {
					entryFileNames: '[name].js',
					chunkFileNames: '[name].js',
				}
			}
		}),
		alias: {
			'$lib': path.resolve(__dirname, 'src/renderer/app/lib'),
		},
		files: {
			appTemplate: 'index.html', // Using root index.html
			routes: 'src/renderer/app/routes',
			lib: 'src/renderer/app/lib',
			assets: 'src/renderer/app/static', // SvelteKit's source for static assets
		},
		embedded: true, // Important for Electron integration
		paths: {
			// SvelteKit's base path should be empty for Electron.
			// Vite's `base: './'` in vite.renderer.config.mjs handles relative paths for production.
			base: '',
		}
	},
};
export default config;
