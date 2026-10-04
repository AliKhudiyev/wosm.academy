// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks, todoMarker } from './src/lib/markdown/plugins.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://wosm.academy',
  // No `base`: the site is served from the domain root (see docs/DEPLOYMENT.md).
  trailingSlash: 'always',
  // Keep HTML whitespace semantics (v7 defaults to JSX rules, which would glue
  // words to inline links in multi-line copy).
  compressHTML: true,
  // Inline the (small) stylesheet so first paint needs no extra request.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      // Temporary review pages never belong in the sitemap.
      filter: (page) => !page.includes('/brand-preview/'),
    }),
  ],
  markdown: {
    processor: satteri({ hastPlugins: [todoMarker, externalLinks] }),
  },
});
