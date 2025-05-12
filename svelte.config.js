// /Users/cliffhall/Projects/chibipos/svelte.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This is the project root

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			// These paths are relative to svelte.vite.config.js#build.outDir ('dist_svelte')
			pages: 'build_output',      // Corrected: will output to dist_svelte/build_output
			assets: 'build_output',     // Corrected: will output to dist_svelte/build_output
			fallback: 'index.html',     // Results in dist_svelte/build_output/index.html
			precompress: false,
			strict: true,
		}),
		alias: {
			'$lib': path.resolve(__dirname, 'src/renderer/app/lib'),
		},
		files: {
			appTemplate: path.resolve(__dirname, 'index.html'),
			routes: 'src/renderer/app/routes',
			lib: 'src/renderer/app/lib',
			assets: 'src/renderer/app/static',
		},
		embedded: true,
		paths: {
			base: '',
		},
		prerender: {
			entries: ['*']
		}
	},
};
export default config;
