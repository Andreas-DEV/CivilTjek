import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { apiRouter } from './src/server/api'

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		strictPort: false,
	}
});