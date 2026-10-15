# Course materials

Lecture slides and other teaching materials, written in LaTeX with the WoSM Academy classes. They are published on
Moodle, not on the website. Licence: CC BY-SA 4.0, like all course materials.

```
materials/
├── templates/                 # the house style; found by every document through TEXINPUTS
│   ├── wosm.sty               # colours, fonts, glider mark and logo, \course, box style
│   ├── wosm-slides.cls        # Beamer class for lecture slides
│   └── wosm-article.cls       # A4 class for exercise sheets and project briefs
└── <course code>/             # e.g. mat231-f27
    └── lecture-01/            # one folder per lecture
        ├── lecture-01.tex
        ├── lecture-01.pdf           # slides, with overlays
        └── lecture-01-handout.pdf   # print version: white page, no overlays
```

## Build

Needs `pdflatex` (TeX Live or MacTeX) with Beamer, TikZ/pgfplots and tcolorbox.

```sh
npm run materials                  # everything
npm run materials -- lecture-02    # only paths containing "lecture-02"
npm run materials -- mat231-f27     # one course
```

Slides give `<name>.pdf` and `<name>-handout.pdf`; sheets (`wosm-article`) give `<name>.pdf` and
`<name>-solutions.pdf`. The PDFs are written next to the source and committed. Run the command after every edit.

To compile by hand, point TeX at the templates (the trailing `:` keeps the default search path):

```sh
cd materials/mat231-f27/lecture-01
TEXINPUTS=../../templates//: pdflatex lecture-01.tex     # twice, for the outline and frame numbers
```

## A new lecture

Copy an existing lecture folder, rename the `.tex` file, and change the title block:

```latex
\documentclass{wosm-slides}
\course{MAT231-F27}{Calculus II}
\title[L03 \textperiodcentered\ Short title]{Title}
\subtitle{Subtitle}
\author{Dr.\ Ali Khudiyev}
\institute{WoSM Academy}
\date{Lecture 03\enspace\textperiodcentered\enspace Unit 3\enspace\textperiodcentered\enspace Fall 2027}
```

Course, author, unit and semester come from the module description
(`src/content/module-descriptions/<code>-module-description.tex`).
Each `\section` gets a numbered divider slide. Blocks: `definition`, `theorem`, `lemma`, `corollary`, `proposition`
(teal), `example` (charcoal), `remark` (muted), `warning` (brick, `\begin{warning}[Common mistake]`), `proof`.

The slides are 16:9 at 11 pt. A frame that is too full runs off the bottom silently in the PDF; the log reports it as
`Overfull \vbox … too high`. Split such frames.

## About `wosm.sty`

The classes need `wosm.sty`, which was not among the files provided with them. The one here is a reconstruction:
the website's light-theme colours (`src/styles/tokens.css`), Latin Modern fonts (as in the module description PDFs),
the glider mark from `src/assets/brand/glider-mark.svg`, and the commands the classes use. If the original exists,
replace this file with it; the lectures only use `\course{<code>}{<title>}` from it.
