// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { externalLinks, todoMarker } from './src/lib/markdown/plugins.mjs';

// Old addresses of pages that moved. They stay valid as redirect pages and are
// left out of the sitemap. Add an entry whenever a course code changes.
/** @type {(from: string, to: string) => [string, string]} */
const cs = (from, to) => [`/courses/computer-science/${from}/`, `/courses/computer-science/${to}/`];
/** @type {(from: string, to: string) => [string, string]} */
const math = (from, to) => [`/courses/mathematics/${from}/`, `/courses/mathematics/${to}/`];
const redirects = Object.fromEntries([
  // Discrete Structures moved from Computer Science (CS103-F26) to Mathematics.
  ['/courses/computer-science/cs103-f26/', '/courses/mathematics/mat101-f26/'],
  // Course codes follow <field><year><previous module><module>-<term><year> (October 2026).
  cs('cs201', 'cs103-s27'),
  cs('cs302', 'cs232-f27'),
  cs('cs401', 'cs203-s28'),
  cs('cs402', 'cs204-s28'),
  cs('cs501', 'cs301-f28'),
  cs('cs502', 'cs302-f28'),
  cs('cs503', 'cs303-f28'),
  math('m101-f26', 'mat101-f26'),
  math('m102-s27', 'mat103-s27'),
  math('m103-s27', 'mat102-s27'),
  math('m201-f27', 'mat231-f27'),
  math('m202-s28', 'mat202-s28'),
]);

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
