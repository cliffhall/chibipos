import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// ssr: {
	// 	noExternal: ['sequelize', 'sqlite3']
	// },
	// optimizeDeps: {
	// 	exclude: ['sequelize', 'sqlite3'],
	// },
});
