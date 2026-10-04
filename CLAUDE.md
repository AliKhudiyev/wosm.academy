# WoSM Academy — website

This repository is the public website of **WoSM Academy** (Wisdom of Starving Minds), served at **https://wosm.academy** via GitHub Pages.

WoSM Academy exists to democratise knowledge: free, open, rigorous courses for anyone, anywhere. The website explains what the Academy is, lists its subjects and courses, tells students how to join, recruits volunteer teachers, and points everyone to the learning platform at **https://moodle.wosm.academy** (a separate Moodle instance on a VPS — this repo never touches it).

Read these before writing code:

| File | What it covers |
|---|---|
| `docs/DESIGN.md` | Visual system: colours, type, layout, components, logo/wordmark |
| `docs/CONTENT.md` | Sitemap, page-by-page content, content schemas, copy voice, draft copy |
| `docs/SIMULATION.md` | The background Game of Life simulation |
| `docs/DEPLOYMENT.md` | GitHub Actions, GitHub Pages, custom domain, DNS |

---

## Decisions already made

- **Name:** Always "WoSM Academy" in running text. "Wisdom of Starving Minds" is spelled out in the hero, the About page, the footer and `<title>`/meta descriptions. Never "WoSM University".
- **Language:** English only (British or American — pick one; default to **British** spelling: "catalogue", "licence" as a noun, "enrol").
- **Stack:** [Astro](https://astro.build) (latest stable), static output, deployed by GitHub Actions to GitHub Pages. TypeScript for scripts. Plain CSS with custom properties (no Tailwind, no CSS-in-JS, no UI component libraries).
- **Content as data:** Courses, subjects, people, vacancies and journal posts are Astro content collections (Markdown + frontmatter, schemas in `src/content.config.ts`). Adding a course or a vacancy must never require touching a layout or component.
- **Subjects at launch:** Computer Science, Mathematics. More will be added.
- **Courses at launch:** 4 (see `docs/CONTENT.md`).
- **Instructors at launch:** 1 (the founder). The People section must scale to many.
- **Admission:** free, open, self-enrolment on Moodle with email confirmation. No application for students.
- **Teacher recruitment:** volunteers apply by email with CV and/or motivation letter. No file uploads through the site.
- **Community:** Discord.
- **Comments/reactions:** giscus (GitHub Discussions), on Journal posts only.
- **Analytics:** none at launch. If added later, it must be cookieless and privacy-respecting (e.g. GoatCounter) and the Privacy page must be updated.
- **Tone:** mostly earnest-academic; occasionally (rarely) playful-hacker — the 404 page, the simulation caption, small details. Never in the manifesto or the Join/Teach pages.

## Hard constraints

1. **Static only.** No server, no database, no serverless functions. Everything must work from `dist/` on GitHub Pages.
2. **Works without JavaScript.** All content, navigation and links must work with JS disabled. JS is only for: the theme toggle, the background simulation, catalogue filtering (progressive enhancement — without JS all courses are simply listed), giscus.
3. **Responsive:** test at 360 px, 768 px, 1024 px, 1440 px widths. No horizontal scroll at any width.
4. **Accessible:** WCAG 2.2 AA. Semantic HTML, visible focus styles, skip link, sufficient contrast in both themes, `prefers-reduced-motion` respected, simulation is `aria-hidden` and decorative.
5. **Light:** no JS framework runtime shipped to the browser (Astro islands only if truly needed — prefer vanilla `<script>`). Target Lighthouse ≥ 95 in all four categories on mobile.
6. **Privacy:** no third-party requests on page load except giscus on Journal posts (loaded lazily). Fonts are self-hosted (via `@fontsource` packages), not Google Fonts. No tracking pixels, no embeds that set cookies.
7. **Never invent facts.** Do not make up names, dates, statistics, testimonials, partner logos, accreditation, student numbers or course details. Where information is missing, insert a visible placeholder in the form `TODO(owner): …` and list it in `TODO.md` at the repo root.
8. **No AI-generated look.** See "What to avoid" in `docs/DESIGN.md`. When in doubt, choose the plainer option.

## Suggested project layout

```
/
├── CLAUDE.md
├── TODO.md                      # open questions & placeholders for the owner
├── docs/                        # these spec files
├── public/
│   ├── CNAME                    # contains: wosm.academy
│   ├── favicon.svg
│   ├── og-default.png           # 1200×630 social card
│   └── robots.txt
├── src/
│   ├── content.config.ts        # collection schemas (zod)
│   ├── content/
│   │   ├── subjects/            # computer-science.md, mathematics.md
│   │   ├── courses/             # one .md per course
│   │   ├── people/              # one .md per person
│   │   ├── vacancies/           # one .md per open role
│   │   └── journal/             # posts
│   ├── components/              # Header, Footer, ThemeToggle, CourseCard, ...
│   ├── layouts/                 # BaseLayout, PageLayout, PostLayout
│   ├── lib/simulation/          # life.ts + engine (see SIMULATION.md)
│   ├── assets/brand/            # logo SVGs
│   ├── styles/                  # tokens.css, base.css, components.css
│   └── pages/                   # routes (see CONTENT.md sitemap)
├── .github/workflows/deploy.yml
└── astro.config.mjs             # site: 'https://wosm.academy'
```

## Build order

Work in this order and stop for review after each milestone:

1. **Scaffold** — Astro project, `astro.config.mjs` with `site`, deploy workflow, `public/CNAME`, base layout, design tokens, fonts, theme toggle (no flash of wrong theme). Deploy a "Hello" page to verify the pipeline.
2. **Brand** — logo/wordmark variants per `docs/DESIGN.md`; favicon; OG image. Present options before committing to one.
3. **Shell** — header with nav and Moodle button, mobile menu, footer, skip link, 404 page.
4. **Content model** — collection schemas + seed content for subjects, 4 courses, 1 person, 1 vacancy, 1 journal post.
5. **Pages** — Home, Courses (catalogue + subject pages + course pages), Join, Teach, About, Journal, Contact, FAQ, Code of Conduct, Licence, Privacy.
6. **Simulation** — per `docs/SIMULATION.md`.
7. **Polish & checks** — RSS, sitemap, meta/OG tags, giscus on posts, accessibility pass, Lighthouse, link check, `TODO.md` up to date.

## Conventions

- Commit messages: imperative, short (`Add course collection schema`).
- CSS: design tokens only from `src/styles/tokens.css`; no hard-coded colours in components.
- Every page sets a unique `<title>` (`Page — WoSM Academy`) and meta description.
- External links (Moodle, Discord, GitHub) get `rel="noopener"` and a small ↗ indicator; they do not open in new tabs unless it's the Moodle button (owner's preference: open Moodle in the same tab — change only if asked).
- Dates: ISO in frontmatter, displayed as `5 October 2026`.
- Keep this file and `docs/*` updated when decisions change.
