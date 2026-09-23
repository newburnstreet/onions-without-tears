// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://onionswithouttears.co.uk',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/visitors') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
