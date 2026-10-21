import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import { sidebar } from './scripts/structure.mjs';

export default defineConfig({
	site: 'https://gyro.how',
	integrations: [
		starlight({
			title: 'gyro.how',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Gyro-how/gyro.how' }],
			editLink: { baseUrl: 'https://github.com/Gyro-how/gyro.how/edit/main/' },
			sidebar: sidebar(),
			plugins: [starlightLlmsTxt()],
		}),
	],
});
