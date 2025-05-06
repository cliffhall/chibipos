// /Users/cliffhall/Projects/chibipos/frontend/vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	appType: 'spa', // Add here to ensure sveltekit() plugin sees it
	plugins: [sveltekit()],
});

