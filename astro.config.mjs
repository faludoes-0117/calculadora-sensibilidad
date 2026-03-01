import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://faludoes-0117.github.io',
  base: '/calculadora-sensibilidad',
  integrations: [preact()],
});