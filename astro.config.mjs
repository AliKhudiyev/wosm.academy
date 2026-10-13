// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks, todoMarker } from './src/lib/markdown/plugins.mjs';

// Old addresses of pages that moved. They stay valid as redirect pages and are
// left out of the sitemap.
const redirects = {
  // Discrete Structures moved from Computer Science (CS103-F26) to Mathematics (M101-F26).
  '/courses/computer-science/cs103-f26/': '/courses/mathematics/m101-f26/',
  // Computer science codes gained their term suffix (odd semesters -F26, even -S27).
  ...Object.fromEntries(
    ['cs201-s27', 'cs302-f26', 'cs401-s27', 'cs402-s27', 'cs501-f26', 'cs502-f26', 'cs503-f26'].map((id) => [
      `/courses/computer-science/${id.split('-')[0]}/`,
      `/courses/computer-science/${id}/`,
    ]),
  ),
};

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
  redirects,
  integrations: [
    sitemap({
      // Temporary review pages never belong in the sitemap.
      filter: (page) =>
        !page.includes('/brand-preview/') && !Object.keys(redirects).some((from) => page.endsWith(from)),
    }),
  ],
  markdown: {
    processor: satteri({ hastPlugins: [todoMarker, externalLinks] }),
  },
});
