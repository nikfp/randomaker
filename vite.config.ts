import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig(({ mode }) => ({
	plugins: [tailwindcss(), sveltekit(), svelteTesting()],
	resolve: {
		conditions: mode === 'test' ? ['browser'] : []
	},
	ssr: {
		noExternal: ['@thisux/sveltednd']
	},
	server: {
		allowedHosts: ['testing.randomaker.com']
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: [
						'node_modules',
						'dist',
						'.svelte-kit',
						'.idea',
						'.git',
						'.cache',
						'src/test/setup.ts',
						'src/**/*.svelte.{test,spec}.{js,ts}',
						'src/**/*.{dom,component}.{test,spec}.{js,ts}'
					]
				}
			},
			{
				extends: true,
				test: {
					name: 'component',
					environment: 'jsdom',
					setupFiles: ['./src/test/setup.ts'],
					include: [
						'src/**/*.svelte.{test,spec}.{js,ts}',
						'src/**/*.{dom,component}.{test,spec}.{js,ts}'
					],
					exclude: [
						'node_modules',
						'dist',
						'.svelte-kit',
						'.idea',
						'.git',
						'.cache',
						'src/test/setup.ts'
					]
				}
			}
		]
	}
}));
