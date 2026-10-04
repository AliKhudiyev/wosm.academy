// Content collections. Adding a course, person, vacancy or post means adding a
// Markdown file in src/content/<collection>/ — never touching a layout.
// See docs/CONTENT.md §3 for field descriptions.
//
// Optional fields the owner has not filled in yet are simply left out of the
// frontmatter; pages then show a visible "TODO(owner)" placeholder.

import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { courseFormats, courseLevels, courseStatuses } from './lib/vocab';

const markdown = (collection: string) => glob({ pattern: '**/*.md', base: `./src/content/${collection}` });

const subjects = defineCollection({
  loader: markdown('subjects'),
  schema: z.object({
    title: z.string(),
    /** Name of the CSS custom property in src/styles/tokens.css, e.g. --subject-cs. */
    colorToken: z.string().regex(/^--subject-[a-z0-9-]+$/),
    order: z.number(),
    summary: z.string(),
  }),
});

const courses = defineCollection({
  loader: markdown('courses'),
  schema: z.object({
    title: z.string(),
    code: z.string(),
    subject: reference('subjects'),
    level: z.enum(courseLevels),
    summary: z.string(),
    /** Omit until confirmed: the course is then shown as "[tbc]" with no enrol button. */
    status: z.enum(courseStatuses).optional(),
    format: z.enum(courseFormats).optional(),
    durationWeeks: z.number().int().positive().optional(),
    /** Free text so ranges work, e.g. "4–6". */
    effortHoursPerWeek: z.string().optional(),
    /** Only for cohort courses. */
    startDate: z.coerce.date().optional(),
    prerequisites: z.array(reference('courses')).default([]),
    recommended: z.array(reference('courses')).default([]),
    instructors: z.array(reference('people')).min(1),
    moodleUrl: z.url().optional(),
    order: z.number(),
  }),
});

const people = defineCollection({
  loader: markdown('people'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      credentials: z.array(z.string()).default([]),
      photo: image().optional(),
      photoAlt: z.string().optional(),
      links: z
        .object({
          website: z.url().optional(),
          github: z.url().optional(),
          scholar: z.url().optional(),
          orcid: z.url().optional(),
          linkedin: z.url().optional(),
        })
        .default({}),
      order: z.number(),
    }),
});

const vacancies = defineCollection({
  loader: markdown('vacancies'),
  schema: z.object({
    title: z.string(),
    /** A subject id, or "any". */
    area: z.string(),
    status: z.enum(['open', 'filled', 'closed']),
    commitment: z.string().optional(),
    posted: z.coerce.date(),
    summary: z.string(),
  }),
});

const journal = defineCollection({
  loader: markdown('journal'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { subjects, courses, people, vacancies, journal };
