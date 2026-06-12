import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { readingTimeRemarkPlugin } from './src/utils/frontmatter.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://monoidx.dev',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          it: 'it',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
  },
});
