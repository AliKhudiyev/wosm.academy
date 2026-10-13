% =============================================================
%  wosm-article.cls — WoSM Academy exercise sheets and project briefs
%  A4 documents based on the article class.
%
%    \documentclass{wosm-article}             solutions hidden
%    \documentclass[solutions]{wosm-article}  solutions shown
%
%  Solutions are also shown when the job name contains "-solutions",
%  so one source gives both versions without editing:
%    pdflatex exercise-01.tex
%    pdflatex -jobname=exercise-01-solutions exercise-01.tex
%
%  See README.md for the commands and environments.
% =============================================================
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{wosm-article}[2026/10/13 v1.0 WoSM Academy exercise sheets and project briefs]

\newif\ifwosm@solutions
\DeclareOption{solutions}{\wosm@solutionstrue}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax
\begingroup
  \edef\x{\endgroup\noexpand\in@{\detokenize{-solutions}}{\jobname}}\x
\ifin@\wosm@solutionstrue\fi
\LoadClass[11pt,a4paper]{article}

\RequirePackage{wosm}
\colorlet{wosm-box}{wosm-bg} % on white paper, boxes are paper-coloured

% ---------- Page ----------------------------------------------
\RequirePackage[a4paper, hmargin=2.8cm, top=2.6cm, bottom=2.6cm,
  headheight=14pt, headsep=0.9cm, footskip=1.1cm]{geometry}
\RequirePackage{parskip}
\linespread{1.08}
\RequirePackage{tabularx}
\newcolumntype{L}{>{\raggedright\arraybackslash}X} % ragged-right X column
\RequirePackage[font=small, labelfont=bf]{caption}

\RequirePackage{titlesec}
\titleformat{\section}{\large\bfseries}
  {\textcolor{wosm-accent}{\ttfamily\mdseries\thesection}}{0.8em}{}
\titleformat{\subsection}{\normalsize\bfseries}
  {\textcolor{wosm-accent}{\ttfamily\mdseries\thesubsection}}{0.8em}{}
\titlespacing*{\section}{0pt}{1.6em}{0.3em}
\titlespacing*{\subsection}{0pt}{1.1em}{0.2em}

\RequirePackage{enumitem}
\setlist{itemsep=2pt, topsep=2pt, parsep=0pt}
\setlist[itemize,1]{label=\wosmbullet}
\setlist[itemize,2]{label=\textcolor{wosm-muted}{\textendash}}
\setlist[enumerate,1]{label=\arabic*., font=\color{wosm-accent}}
% A list with empty boxes, for submission checklists.
\newlist{checklist}{itemize}{1}
\setlist[checklist]{label=\texttt{[\ ]}, leftmargin=2.2em, itemsep=2pt, topsep=2pt}

% ---------- Title block ---------------------------------------
% \title[<short title for the header>]{<title>}, \subtitle{...},
% \author{...}, and any number of \info{<label>}{<value>} lines,
% e.g. \info{Due}{12 October 2026}.
\newcommand*\wosm@shorttitle{}
\newcommand*\wosm@subtitle{}
\newcommand*\wosm@info{}
\renewcommand\title[2][]{%
  \gdef\@title{#2}%
  \if\relax\detokenize{#1}\relax\gdef\wosm@shorttitle{#2}\else\gdef\wosm@shorttitle{#1}\fi}
\newcommand\subtitle[1]{\gdef\wosm@subtitle{#1}}
\newcommand\info[2]{%
  \g@addto@macro\wosm@info{\mbox{\wosmlabel{#1}\enspace#2}\hskip1.6em plus 0.5em\relax}}

\renewcommand\maketitle{%
  \thispagestyle{plain}%
  \begingroup\setlength\parskip{0pt}%
  {\large\wosmlogo}\hfill
    \wosmlabel{\href{https://wosm.academy}{wosm.academy}}\par
  \vspace{2.2em}%
  \wosm@courseline
    \ifwosm@solutions\hfill\wosmlabel{[with solutions]}\fi\par
  \vspace{0.5em}%
  {\LARGE\bfseries\raggedright\@title\par}%
  \ifx\wosm@subtitle\@empty\else
    \vspace{0.3em}{\large\color{wosm-muted}\wosm@subtitle\par}%
  \fi
  \vspace{0.9em}%
  {\@author\par}%
  \ifx\wosm@info\@empty\else
    \vspace{0.3em}{\raggedright\wosm@info\par}%
  \fi
  \vspace{0.8em}%
  \textcolor{wosm-rule}{\rule{\linewidth}{0.4pt}}\par
  \endgroup
  \vspace{0.6em}}

% ---------- Header and footer ---------------------------------
\RequirePackage{fancyhdr}
\RequirePackage{lastpage}
\newcommand*\wosm@footer{%
  \fancyfoot[L]{\wosmlabel{\wosmlicence\enspace\textperiodcentered\enspace Wisdom of Starving Minds}}%
  \fancyfoot[R]{\wosmlabel{\thepage\,/\,\pageref*{LastPage}}}}
\fancypagestyle{plain}{\fancyhf{}\wosm@footer}
\pagestyle{fancy}
\fancyhf{}
\renewcommand\headrulewidth{0pt}
\fancyhead[L]{\wosmlabel{%
  \ifx\wosm@coursecode\@empty\else\wosm@coursecode\enspace\textperiodcentered\enspace\fi
  \wosm@shorttitle}}
\fancyhead[R]{\textcolor{wosm-muted}{\wosmmark[0.75em]}}
\wosm@footer

% ---------- Theorems and callouts -----------------------------
% Same names as on the slides: definition, theorem, lemma, proposition,
% corollary, example, remark, warning, proof (amsthm, from wosm.sty).
\newcommand*\wosm@thmstyle[2]{%
  \newtheoremstyle{#1}{0pt}{0pt}{\normalfont}{0pt}{\bfseries\color{#2}}{.}{0.5em}{}}
\wosm@thmstyle{wosm-accent}{wosm-accent}
\wosm@thmstyle{wosm-text}{wosm-text}
\wosm@thmstyle{wosm-muted}{wosm-muted}
\wosm@thmstyle{wosm-brick}{wosm-brick}

\theoremstyle{wosm-accent}
\newtheorem{theorem}{Theorem}
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{corollary}[theorem]{Corollary}
\newtheorem{definition}[theorem]{Definition}
\theoremstyle{wosm-text}
\newtheorem{example}[theorem]{Example}
% remark and warning: the optional argument replaces the heading,
% e.g. \begin{warning}[Common mistake], as on the slides.
\newcommand*\wosm@heading{}
\theoremstyle{wosm-muted}
\newtheorem*{wosm@remark}{\wosm@heading}
\theoremstyle{wosm-brick}
\newtheorem*{wosm@warning}{\wosm@heading}
\NewDocumentEnvironment{remark}{O{Remark}}
  {\def\wosm@heading{#1}\begin{wosm@remark}}{\end{wosm@remark}}
\NewDocumentEnvironment{warning}{O{Warning}}
  {\def\wosm@heading{#1}\begin{wosm@warning}}{\end{wosm@warning}}

\tcbuselibrary{breakable}
\tcbset{wosm/.append style={breakable}}
\tcolorboxenvironment{theorem}{wosm=wosm-accent}
\tcolorboxenvironment{lemma}{wosm=wosm-accent}
\tcolorboxenvironment{proposition}{wosm=wosm-accent}
\tcolorboxenvironment{corollary}{wosm=wosm-accent}
\tcolorboxenvironment{definition}{wosm=wosm-accent}
\tcolorboxenvironment{example}{wosm=wosm-text}
\tcolorboxenvironment{remark}{wosm=wosm-muted}
\tcolorboxenvironment{warning}{wosm=wosm-brick}

% ---------- Exercises -----------------------------------------
% \begin{exercise}[<title>][<badge, e.g. 4 points>] ... \end{exercise}
% Inside an exercise, enumerate numbers its parts (a), (b), ...
\newcounter{exercise}
\NewDocumentEnvironment{exercise}{o o}{%
  \par\addvspace{1.2em}%
  \refstepcounter{exercise}%
  \setlist[enumerate,1]{label=(\alph*), ref=(\alph*), font=\color{wosm-accent}}%
  \noindent{\large\bfseries Exercise~\theexercise\IfValueT{#1}{: #1}}%
  \IfValueT{#2}{\hfill\wosmlabel{[#2]}}%
  \par\nobreak\vspace{0.2em}\nobreak
}{\par}

% \begin{hint} ... \end{hint}: always shown.
\NewDocumentEnvironment{hint}{}{%
  \par\textcolor{wosm-muted}{\itshape Hint.}\enspace\ignorespaces
}{\par}

% \begin{solution} ... \end{solution}: shown only with solutions.
% Code listings and \verb work inside.
\RequirePackage{verbatim}
\ifwosm@solutions
  \newenvironment{solution}
    {\begin{tcolorbox}[wosm=wosm-accent, title=Solution]}
    {\end{tcolorbox}}
\else
  \let\solution\comment
  \let\endsolution\endcomment
\fi

% ---------- Links ---------------------------------------------
\RequirePackage[colorlinks=true, linkcolor=wosm-accent, urlcolor=wosm-accent,
  citecolor=wosm-accent]{hyperref}
\AtBeginDocument{\hypersetup{pdftitle={\@title}, pdfauthor={\@author}}}

\endinput
