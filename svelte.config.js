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
			pages: path.resolve(__dirname, '.vite/renderer/main_window'),
			assets: path.resolve(__dirname, '.vite/renderer/main_window'),
			fallback: 'index.html',
			precompress: false,
			strict: true,
		}),
		alias: {
			'$lib': path.resolve(__dirname, 'src/renderer/app/lib'),
		},
		files: {
			appTemplate: 'index.html',
			routes: 'src/renderer/app/routes',
			lib: 'src/renderer/app/lib',
			assets: 'src/renderer/app/static',
		},
		embedded: true, // Important for Electron integration
		paths: {
			// SvelteKit's base path should be empty for Electron.
			// Vite's `base: './'` in vite.renderer.config.mjs handles relative paths for production.
			base: ''
		},
		appDir: '_app', // Directive for browser to load assets from
		prerender: {
			entries: ['*']
		}
	},
};
export default config;
