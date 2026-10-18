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
- **Stack:** [Astro](https://astro.build) (latest stable — currently 7.x), static output, deployed by GitHub Actions to GitHub Pages. TypeScript for scripts. Plain CSS with custom properties (no Tailwind, no CSS-in-JS, no UI component libraries).
  - Astro 7 notes: Markdown is rendered by Sätteri (custom hast plugins in `src/lib/markdown/plugins.mjs`); `compressHTML: true` is set so multi-line copy keeps its spaces (v7's default JSX whitespace rules would glue words to links); stylesheets are inlined (`build.inlineStylesheets: 'always'`).
- **Content as data:** Courses, subjects, people, vacancies and journal posts are Astro content collections (Markdown + frontmatter, schemas in `src/content.config.ts`). Adding a course or a vacancy must never require touching a layout or component.
- **Subjects at launch:** Computer Science, Mathematics. More will be added.
- **Courses:** 14, one per Foundation programme module with a description. Offered now (`status: open`): CS101-F26 Introduction to Informatics, CS102-F26 Digital Design and Computer Architecture I, MAT101-F26 Discrete Structures (Mathematics). The other 11 (CS103-S27, CS232-F27, CS203-S28, CS204-S28, CS301-F28, CS302-F28, CS303-F28, MAT102-S27, MAT103-S27, MAT231-F27, MAT202-S28) are `status: planned`: their pages show the module description but no enrol button. Courses show the **semester** (from `\Level` in the .tex), not a level.
- **Course codes:** `<field><year><PMID><MID>-<term><absolute year>`, e.g. `CS232-F27`.
  - `<field>`: `CS` (computer science) or `MAT` (mathematics).
  - `<year>`: academic year — 1 for semesters 1–2, 2 for semesters 3–4, 3 for semester 5 and later.
  - `<PMID>`: the MID of the module this one continues (DDCA II → DDCA I's MID), else 0.
  - `<MID>`: module number from 1, unique per field within an academic year, assigned in plan order (semester, then position in `src/content/programmes/foundation.md`).
  - `<term>`: `F` (Fall) for odd semesters, `S` (Spring) for even ones.
  - `<absolute year>`: year the module is first taught — semester 1: 26, semesters 2–3: 27, semesters 4–5: 28, later: 29. `\Semester` in the .tex is the matching term (e.g. “Fall 2027”).
  - The lower-cased code is the course file name and page address; the .tex/.pdf are named `<field><year><PMID><MID>-module-description`. When a code changes, add the old address to `redirects` in `astro.config.mjs`.
- **Credits:** ECTS-style, 30 study hours per credit, rounded (the Total row of the hours table ÷ 30).
- **Programme:** `/programme/` presents a **Foundation programme** (5 core semesters × 3 modules, then optional research/project work as a thesis) and an **Advanced programme** (3–4 semesters, planned, not designed yet). Never call them BSc/MSc or imply a degree. The note at the top of the page lists the modules that are offered (computed from course status). Plans live in `src/content/programmes/*.md`.
- **Module descriptions are LaTeX:** `src/content/module-descriptions/<code>-module-description.tex`, based on `_template.tex`, converted to HTML at build time (`src/lib/module-descriptions/`). A description whose `\ModuleCode` equals a course's `code` replaces that course page's body; credits and hours on `/programme/` come from it. Keep the files compilable with `pdflatex`; the compiled PDFs are committed next to them (`npm run pdfs`) and offered for download at `/module-descriptions/<name>.pdf`. Module leader email and office hours are shown as written.
- **Course materials are LaTeX, outside the website:** lectures (`wosm-slides`), exercise sheets and project briefs (`wosm-article`) live in `materials/<course code, lower-cased>/` and use the shared classes in `materials/latex/` (do not edit those for one course). `npm run materials` compiles them; the PDFs (slides plus a `-handout` print version) are committed and uploaded to Moodle. CS102-F26 lectures follow the module leader's book chapter by chapter. See `materials/README.md`.
- **Instructors at launch:** 1 — Ali Khudiyev, Founder & Director. The People section must scale to many.
- **Admission:** free, open, self-enrolment on Moodle with email confirmation. No application for students.
- **Teacher recruitment:** volunteers apply by email (teach@wosm.academy) with CV and/or motivation letter. No file uploads through the site.
- **Contact:** general enquiries hello@wosm.academy. Moodle signup: https://moodle.wosm.academy/login/signup.php.
- **Licences:** website code MIT; course materials and website content CC BY-SA 4.0.
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
├── scripts/build-brand-assets.mjs  # `npm run brand`: favicon, touch icon, OG image, logo SVGs
├── scripts/build-module-pdfs.mjs   # `npm run pdfs`: compile module descriptions with pdflatex
├── scripts/build-materials.mjs     # `npm run materials`: compile lecture slides and exercise sheets
├── materials/                   # course materials in LaTeX (not part of the site): latex/ classes, <course>/lectures/
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
│   │   ├── journal/             # posts
│   │   ├── programmes/          # foundation.md, advanced.md (semester plans)
│   │   └── module-descriptions/ # one .tex + compiled .pdf per course (+ _template.tex)
│   ├── config/                  # site.ts (links, emails), giscus.ts, brand.ts (logo variant)
│   ├── components/              # Header, Footer, ThemeToggle, CourseItem, Todo, ...
│   ├── layouts/                 # BaseLayout, PageLayout, PostLayout
│   ├── lib/                     # content.ts (queries, URLs), format.ts, vocab.ts, markdown/, simulation/,
│   │                            # module-descriptions/ (LaTeX → HTML converter + content loader)
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

## Status

All seven milestones were built in one pass (owner's choice) and committed locally; nothing has been pushed.
Open items for the owner are in `TODO.md`, including the logo choice on the temporary `/brand-preview/` page.

## Conventions

- Commit messages: imperative, short (`Add course collection schema`).
- CSS: design tokens only from `src/styles/tokens.css`; no hard-coded colours in components.
- Every page sets a unique `<title>` (`Page — WoSM Academy`) and meta description.
- External links (Moodle, Discord, GitHub) get `rel="noopener"` and a small ↗ indicator; they do not open in new tabs unless it's the Moodle button (owner's preference: open Moodle in the same tab — change only if asked).
- Dates: ISO in frontmatter, displayed as `5 October 2026`.
- Missing facts: use the `<Todo>` component in `.astro` files, or write `TODO(owner): …` in Markdown (highlighted automatically); omit unknown optional frontmatter fields (pages show a placeholder). List every one in `TODO.md`.
- Check before committing: `npm run check && npm run build && npm run linkcheck`.
- Keep this file and `docs/*` updated when decisions change.
