// /Users/cliffhall/Projects/chibipos/src/renderer/app/svelte.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			pages: '../../../.vite/renderer-static/pages',
			assets: '../../../.vite/renderer-static/assets',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		alias: {
			'$lib': 'src/renderer/app/lib/',
		},
		files: {
			appTemplate: 'index.html',
			routes: 'src/renderer/app/routes',
			lib: 'src/renderer/app/lib',
		},
		embedded:true,
	},
};
export default config;
