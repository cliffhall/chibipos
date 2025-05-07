// src/renderer/svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Default options:
			pages: '../../.vite/renderer-static/pages', // Output dir for static pages
			assets: '../../.vite/renderer-static/assets', // Output dir for static assets
			fallback: 'index.html', // or '200.html' or '404.html' if you want SPA mode
			precompress: false,
			strict: true
		}),
		// Update paths for aliases if they were relative to the old project root
		alias: {
			'$lib': './app/lib', // Assuming $lib pointed to frontend/src/lib
			// and 'app' is where you moved frontend/src contents
			// Add other aliases if you have them
		},
		// Ensure appDir points to your SvelteKit source files
		// Default is 'src', which within the context of svelte.config.js
		// being in src/renderer/ means src/renderer/src.
		// We moved frontend/src to src/renderer/app, so:
		appDir: 'app',
	}
};
export default config;

