# WoSM Academy — website

Source of **https://wosm.academy**, the public website of WoSM Academy (Wisdom of Starving Minds): free, open,
rigorous courses for anyone, anywhere. Courses themselves are taught on Moodle at https://moodle.wosm.academy.

Built with [Astro](https://astro.build) as a fully static site and deployed to GitHub Pages by GitHub Actions.

## Develop

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev        # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check` | Type-check (`astro check`) |
| `npm run linkcheck` | Check internal links and anchors in `dist/` (run after `build`) |
| `npm run brand` | Regenerate favicon, touch icon, OG image and logo SVGs |

## Editing content

Content lives in Markdown files under `src/content/`. Adding one never requires touching a layout:

| To add… | Create a file in… |
|---|---|
| a course | `src/content/courses/` (see an existing course for the fields) |
| a subject | `src/content/subjects/` (and a `--subject-…` colour token in `src/styles/tokens.css`) |
| a person | `src/content/people/` |
| a teaching vacancy | `src/content/vacancies/` |
| a Journal post | `src/content/journal/` (a folder with `index.md` if the post has images) |
| a module description | `src/content/module-descriptions/` — copy `_template.tex`; `\ModuleCode` must equal the course's `code` |
| a module to the programme plan | `src/content/programmes/foundation.md` |

Field definitions are in `src/content.config.ts` and `docs/CONTENT.md`. Links and addresses (Discord, email, Moodle)
are in `src/config/site.ts`. Anything still missing is shown on the site as a highlighted `TODO(owner): …` and listed
in [`TODO.md`](TODO.md).

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — decisions and constraints
- [`docs/DESIGN.md`](docs/DESIGN.md) — visual system
- [`docs/CONTENT.md`](docs/CONTENT.md) — sitemap and content
- [`docs/SIMULATION.md`](docs/SIMULATION.md) — the background Game of Life
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — GitHub Pages, DNS, giscus

## Licence

Code: [MIT](LICENSE). Content and course materials: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
