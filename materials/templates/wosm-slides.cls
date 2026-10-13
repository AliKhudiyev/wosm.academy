% =============================================================
%  wosm-slides.cls — WoSM Academy lecture and presentation slides
%  A Beamer class: everything Beamer can do works here.
%
%    \documentclass{wosm-slides}             16:9 slides on paper colour
%    \documentclass[handout]{wosm-slides}    print version: white, no overlays
%    \documentclass[aspectratio=43]{wosm-slides}
%
%  Frames are top-aligned; use \begin{frame}[c] to centre one.
%  See README.md for the commands and environments.
% =============================================================
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{wosm-slides}[2026/10/13 v1.0 WoSM Academy slides]

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{beamer}}
\ProcessOptions\relax
% 16:9 unless the document asks for another aspect ratio.
\@expandtwoargs\in@{aspectratio}{\@classoptionslist}
\ifin@\else\PassOptionsToClass{aspectratio=169}{beamer}\fi
\PassOptionsToClass{t}{beamer}
\LoadClass{beamer}

\RequirePackage{wosm}

% ---------- Fonts and colours ---------------------------------
\usefonttheme{professionalfonts} % keep the maths fonts from wosm.sty
\usefonttheme{serif}

\setbeamercolor{normal text}{fg=wosm-text, bg=wosm-bg}
\setbeamercolor{background canvas}{bg=wosm-bg}
\setbeamercolor{structure}{fg=wosm-accent}
\setbeamercolor{alerted text}{fg=wosm-brick}
\setbeamercolor{example text}{fg=wosm-text}
\setbeamercolor{title}{fg=wosm-text}
\setbeamercolor{subtitle}{fg=wosm-muted}
\setbeamercolor{frametitle}{fg=wosm-text}
\setbeamercolor{framesubtitle}{fg=wosm-muted}
\setbeamercolor{footline}{fg=wosm-muted}
\setbeamercolor{caption}{fg=wosm-muted}
\setbeamercolor{caption name}{fg=wosm-muted}
\setbeamercolor{section in toc}{fg=wosm-text}
\setbeamercolor{subsection in toc}{fg=wosm-muted}
\setbeamercolor{description item}{fg=wosm-text}

% Print version: white page, paper-coloured boxes.
\mode<handout>{%
  \setbeamercolor{background canvas}{bg=white}%
  \colorlet{wosm-box}{wosm-bg}%
}

\setbeamerfont{title}{size=\LARGE, series=\bfseries}
\setbeamerfont{subtitle}{size=\large, series=\mdseries}
\setbeamerfont{frametitle}{size=\Large, series=\bfseries}
\setbeamerfont{framesubtitle}{size=\normalsize, series=\mdseries}
\setbeamerfont{footline}{size=\tiny, family=\ttfamily}
\setbeamerfont{block title}{series=\bfseries}
\setbeamerfont{description item}{series=\bfseries}

\hypersetup{colorlinks=true, linkcolor=., urlcolor=wosm-accent}

% ---------- Frame furniture -----------------------------------
\setbeamertemplate{navigation symbols}{}
\setbeamersize{text margin left=1cm, text margin right=1cm}

% Section eyebrow ("02 · Relations") above the frame title.
\setbeamertemplate{frametitle}{%
  \vskip0.7em
  \ifnum\c@section>0
    {\ttfamily\scriptsize\color{wosm-muted}%
     \two@digits{\c@section}\enspace\textperiodcentered\enspace\insertsectionhead\par}%
    \vskip0.2em
  \fi
  {\usebeamerfont{frametitle}\usebeamercolor[fg]{frametitle}\insertframetitle\par}%
  \ifx\insertframesubtitle\@empty\else
    \vskip0.15em
    {\usebeamerfont{framesubtitle}\usebeamercolor[fg]{framesubtitle}\insertframesubtitle\par}%
  \fi
  \vskip0.2em
}

% Footline: rule, mark, course code and short title, frame number.
\newcommand*\wosm@footlinelabel{%
  \ifx\wosm@coursecode\@empty WoSM Academy\else\wosm@coursecode\fi
  \enspace\textperiodcentered\enspace\insertshorttitle}
\setbeamertemplate{footline}{%
  \leavevmode
  \hbox to\paperwidth{\hskip1cm
    \vbox{\hsize=\dimexpr\paperwidth-2cm\relax
      \hbox{\textcolor{wosm-rule}{\rule{\hsize}{0.4pt}}}
      \vskip4pt
      \hbox to\hsize{\usebeamerfont{footline}\usebeamercolor[fg]{footline}%
        \wosmmark[0.75em]\enspace\wosm@footlinelabel
        \hfil\insertframenumber\,/\,\inserttotalframenumber}}%
    \hss}%
  \vskip7pt}

% ---------- Title, outline and section frames -----------------
% \maketitle makes the title frame (no footline, not counted).
\renewcommand\maketitle{\frame[plain,noframenumbering,c]{\titlepage}}

\setbeamertemplate{title page}{%
  {\large\wosmlogo\par}%
  \vskip0pt plus 1fill
  {\wosm@courseline\par}%
  \vskip0.5em
  {\usebeamerfont{title}\usebeamercolor[fg]{title}\inserttitle\par}%
  \ifx\insertsubtitle\@empty\else
    \vskip0.3em
    {\usebeamerfont{subtitle}\usebeamercolor[fg]{subtitle}\insertsubtitle\par}%
  \fi
  \vskip1.6em
  {\insertauthor\par}%
  \ifx\insertinstitute\@empty\else{\small\color{wosm-muted}\insertinstitute\par}\fi
  \ifx\insertdate\@empty\else
    \vskip0.2em{\ttfamily\footnotesize\color{wosm-muted}\insertdate\par}%
  \fi
  \vskip0pt plus 1fill
  \textcolor{wosm-rule}{\rule{\linewidth}{0.4pt}}\par
  \vskip2pt
  {\ttfamily\tiny\color{wosm-muted}%
   Wisdom of Starving Minds\enspace\textperiodcentered\enspace
   \href{https://wosm.academy}{wosm.academy}\hfill\wosmlicence\par}%
}

\setbeamertemplate{section in toc}{%
  {\ttfamily\small\color{wosm-accent}\two@digits{\inserttocsectionnumber}}%
  \enspace\inserttocsection\par}
\setbeamertemplate{subsection in toc}{%
  \leavevmode\hspace*{2.1em}{\small\inserttocsubsection}\par}

% A divider frame at the start of each section. To switch it off,
% put \AtBeginSection{} in your preamble.
\setbeamertemplate{section page}{%
  {\ttfamily\Large\color{wosm-accent}\two@digits{\c@section}\par}%
  \vskip0.3em
  {\usebeamerfont{title}\usebeamercolor[fg]{title}\insertsectionhead\par}%
  \vskip0.6em
  \textcolor{wosm-rule}{\rule{4em}{0.4pt}}\par}
\AtBeginSection[]{\frame[plain,noframenumbering,c]{\usebeamertemplate{section page}}}

% ---------- Lists, captions -----------------------------------
\setbeamertemplate{itemize item}{\wosmbullet}
\setbeamertemplate{itemize subitem}{\textcolor{wosm-muted}{\textendash}}
\setbeamertemplate{itemize subsubitem}{\textcolor{wosm-muted}{\textperiodcentered}}
\setbeamertemplate{enumerate item}{\usebeamercolor[fg]{structure}\insertenumlabel.}
\setbeamertemplate{enumerate subitem}{\usebeamercolor[fg]{structure}(\insertsubenumlabel)}
\setbeamertemplate{caption}{\raggedright\usebeamercolor[fg]{caption}\footnotesize\insertcaption\par}

% ---------- Blocks --------------------------------------------
% block, theorem, definition, lemma, ... : teal
% exampleblock, example                   : charcoal
% alertblock, warning                     : brick
% remark                                  : muted
\def\wosm@blockcolour{wosm-accent}
\newcommand*\wosm@blockbegin[1]{%
  \begin{tcolorbox}[wosm=#1,
    code={\ifx\insertblocktitle\@empty\else\tcbset{title=\insertblocktitle}\fi}]}
\setbeamertemplate{block begin}{\wosm@blockbegin{\wosm@blockcolour}}
\setbeamertemplate{block end}{\end{tcolorbox}}
\setbeamertemplate{block example begin}{\wosm@blockbegin{wosm-text}}
\setbeamertemplate{block example end}{\end{tcolorbox}}
\setbeamertemplate{block alerted begin}{\wosm@blockbegin{wosm-brick}}
\setbeamertemplate{block alerted end}{\end{tcolorbox}}

\setbeamertemplate{theorems}[normal font]
\newtheorem{proposition}[theorem]{Proposition}

\newenvironment<>{remark}[1][Remark]{%
  \def\wosm@blockcolour{wosm-muted}\begin{block}#2{#1}}{\end{block}}
\newenvironment<>{warning}[1][Warning]{%
  \begin{alertblock}#2{#1}}{\end{alertblock}}

\endinput
