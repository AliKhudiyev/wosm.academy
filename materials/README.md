# Course materials

Lecture slides, exercise sheets and project briefs, written in LaTeX. They are not part of the website: the PDFs
are uploaded to the course pages on Moodle.

| Folder | What it holds |
|---|---|
| `latex/` | The shared look: `wosm.sty`, `wosm-slides.cls` (lectures), `wosm-article.cls` (exercise sheets, project briefs). Change these for every course or not at all. |
| `<course>/lectures/` | One `lecture-NN.tex` per lecture, with its compiled PDFs; images in `figures/`; settings shared by the course's lectures (course, author, semester, helpers) in a `.sty` file |

`<course>` is the lower-cased course code, as in `src/content/courses/` (e.g. `cs102-f26`).

## Build

Needs `pdflatex` (TeX Live or MacTeX).

```sh
npm run materials                 # everything
npm run materials -- lecture-01   # only files whose path contains "lecture-01"
```

Each file is compiled to a PDF next to it. Slides also get `<name>-handout.pdf` (white pages, no overlays, for
printing); exercise sheets that contain `solution` environments also get `<name>-solutions.pdf`. The PDFs are
committed. Files whose name starts with `_` are skipped.

## Lectures

| Course | Lecture | Unit | Book |
|---|---|---|---|
| CS102-F26 | `lecture-01.tex` — The Essence of Computing | 1 | Chapter 1 |
| CS102-F26 | `lecture-02.tex` — Numeral Systems | 2 | Section 2.1 |
| CS102-F26 | `lecture-03.tex` — Boolean Algebra | 3 | Section 2.2 |
| CS102-F26 | `lecture-04.tex` — Boolean Functions | 4 | Sections 2.3, 2.3.1 |
| CS102-F26 | `lecture-05.tex` — Karnaugh Maps | 5 | Section 2.3.2 |

CS102-F26 lectures start with `\usepackage{cs102-lectures}` (`cs102-f26/lectures/cs102-lectures.sty`), which also
has helpers for logic gates (`gates` TikZ style) and Karnaugh maps (`kmap` environment).
