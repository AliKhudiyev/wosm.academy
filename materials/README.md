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
| CS102-F26 | `lecture-06.tex` — Logic Gates | 6 | Chapter 3 |
| CS102-F26 | `lecture-07.tex` — Multiplexers and Demultiplexers | 7 | Chapter 4 intro, Sections 4.1.1, 4.1.2 |
| CS102-F26 | `lecture-08.tex` — Encoders and Decoders | 8 | Sections 4.1.3, 4.1.4 |
| CS102-F26 | `lecture-09.tex` — Timing | 9 | Section 4.2 |
| CS102-F26 | `lecture-10.tex` — Finite State Machines | 10 | Chapter 5 intro, Section 5.1 |
| CS102-F26 | `lecture-11.tex` — The Clock and Latches | 11 | Sections 5.2, 5.3, 5.3.1, 5.3.2 |
| CS102-F26 | `lecture-12.tex` — Flip-Flops | 12 | Sections 5.3.3–5.3.5 |
| CS102-F26 | `lecture-13.tex` — Counters | 13 | Section 5.4 |
| CS102-F26 | `lecture-14.tex` — Timing of Sequential Circuits | 14 | Section 5.5 |
| CS102-F26 | `lecture-15.tex` — Instruction Set Architecture | 15 | Chapter 6 intro, Section 6.1 |
| CS102-F26 | `lecture-16.tex` — Arithmetic | 16 | Section 6.2 |
| CS102-F26 | `lecture-17.tex` — Logic and Comparison | 17 | Section 6.3 |
| CS102-F26 | `lecture-18.tex` — The Arithmetic Logic Unit | 18 | Section 6.4 |
| CS102-F26 | `lecture-19.tex` — Memory | 19 | Section 6.5, register file of Section 6.6.2 |
| CS102-F26 | `lecture-20.tex` — Processor Design | 20 | Section 6.6 intro, Section 6.6.1 |
| CS102-F26 | `lecture-21.tex` — The Stepper, the Data Path and the Controller | 21 | Sections 6.6.2, 6.6.3 |
| CS102-F26 | `lecture-22.tex` — Building and Programming the DX8 | 22 | Section 6.6.4, Epilogue, Figure 6.13 |
| CS102-F26 | `lecture-23.tex` — Course Review | 23 | (review of Units 1–22; the exam) |

CS102-F26 lectures start like this (the `\input@path` lets the files also compile with the classes in
`templates/latex/` or one folder up):

```latex
\makeatletter
\def\input@path{{templates/latex/}{../}}
\makeatother

\documentclass[10pt]{wosm-slides}
\usepackage{cs102-lectures}[2026/10/20]
```

`cs102-lectures.sty` (in `cs102-f26/lectures/`) sets the course, author and semester, and also
has helpers for logic gates (`gates` TikZ style), multiplexers (`mux`, `mux4` and `demux` pics), Karnaugh maps
(`kmap` environment), latches and flip-flops (`dlatch` and `dff` pics) and timing diagrams (`\timingwave`,
`\timingmark`, `\timingedge`). When you add a helper, bump the date in its `\ProvidesPackage` line and in the
lectures that use it.

If a lecture stops compiling with errors such as `I do not know the key '/tikz/pics/mux'`, LaTeX has found an older
copy of `cs102-lectures.sty`. Lectures ask for the version they need (`\usepackage{cs102-lectures}[2026/10/20]`), so
the log then also says `You have requested ... version`. Replace the old copy, or delete it so the one next to the
lectures is used.
