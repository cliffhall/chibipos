import path from 'path';
import { fileURLToPath } from 'url';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

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
			pages: 'dist_svelte',
			assets: 'dist_svelte',
			precompress: false,
			fallback: 'index.html',
			strict: true,
		}),
		alias: {
			'$lib': path.resolve(__dirname, 'src','renderer','lib'),
		},
		files: {
			appTemplate: 'src/renderer/index.html',
			routes: 'src/renderer/routes',
			lib: 'src/renderer/lib',
			assets: 'src/renderer/static',
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
