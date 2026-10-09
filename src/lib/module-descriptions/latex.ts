// Converts a module description written in LaTeX (see
// src/content/module-descriptions/_template.tex) into metadata and HTML.
//
// Only the subset of LaTeX used by the template is supported: \newcommand
// metadata, \section/\subsection, paragraphs, itemize/enumerate/description,
// tabular/tabularx with booktabs rules, \textbf/\textit/\emph/\texttt/\href/\url,
// escapes, dashes, quotes, accents and simple inline maths. Everything before
// the first \section (title block, summary table) is skipped: the website
// shows that information from the metadata instead. Unsupported commands are
// reported through `warn` and rendered as plain text.
//
// This file has no imports so it can also be run directly with Node.

export interface ModuleMeta {
  title: string;
  code: string;
  programme?: string;
  level?: string;
  semester?: string;
  credits?: string;
  /** Leading number of `credits`, e.g. 10 for "10 ECTS". */
  creditsValue?: number;
  leader?: string;
  email?: string;
  officeHours?: string;
  prerequisites?: string;
  /** Rows of the first table with an "Hours" column (Teaching and Learning Methods). */
  hours?: { rows: Array<{ activity: string; hours: string }>; total?: string; totalValue?: number };
}

export interface ConvertedModule {
  meta: ModuleMeta;
  html: string;
  headings: Array<{ depth: number; slug: string; text: string }>;
}

const META_MACROS: Record<string, keyof ModuleMeta> = {
  ModuleTitle: 'title',
  ModuleCode: 'code',
  Programme: 'programme',
  Program: 'programme',
  Level: 'level',
  Semester: 'semester',
  Credits: 'credits',
  ModuleLeader: 'leader',
  Email: 'email',
  OfficeHours: 'officeHours',
  Prerequisites: 'prerequisites',
};

/** Commands that are dropped together with their brace arguments. */
const IGNORED_WITH_ARGS: Record<string, number> = {
  vspace: 1,
  'vspace*': 1,
  hspace: 1,
  'hspace*': 1,
  color: 1,
  label: 1,
  setlength: 2,
  addtolength: 2,
  setcounter: 2,
  pagestyle: 1,
  thispagestyle: 1,
  cmidrule: 1,
  definecolor: 3,
  titleformat: 5,
  titlespacing: 4,
  'titlespacing*': 4,
};

/** Commands without arguments that produce nothing in HTML. */
const IGNORED = new Set([
  'noindent',
  'indent',
  'centering',
  'raggedright',
  'raggedleft',
  'newpage',
  'clearpage',
  'pagebreak',
  'linebreak',
  'smallskip',
  'medskip',
  'bigskip',
  'par',
  'hfill',
  'vfill',
  'tiny',
  'scriptsize',
  'footnotesize',
  'small',
  'normalsize',
  'large',
  'Large',
  'LARGE',
  'huge',
  'Huge',
  'normalfont',
  'toprule',
  'midrule',
  'bottomrule',
  'hline',
  'addlinespace',
  'maketitle',
  'tableofcontents',
  'protect',
  'relax',
  'selectfont',
  '@',
  '/',
  '-',
]);

const SYMBOLS: Record<string, string> = {
  ldots: '…',
  dots: '…',
  textendash: '–',
  textemdash: '—',
  textbackslash: '\\',
  textbar: '|',
  textless: '<',
  textgreater: '>',
  textasciitilde: '~',
  textasciicircum: '^',
  textbullet: '•',
  textdegree: '°',
  textquoteleft: '‘',
  textquoteright: '’',
  textquotedblleft: '“',
  textquotedblright: '”',
  copyright: '©',
  S: '§',
  P: '¶',
  euro: '€',
  pounds: '£',
  LaTeX: 'LaTeX',
  TeX: 'TeX',
  i: 'ı',
  o: 'ø',
  O: 'Ø',
  ss: 'ß',
  ae: 'æ',
  AE: 'Æ',
  oe: 'œ',
  OE: 'Œ',
  aa: 'å',
  AA: 'Å',
  l: 'ł',
  L: 'Ł',
  quad: ' ',
  qquad: '  ',
  ',': ' ',
  ';': ' ',
  ':': ' ',
  ' ': ' ',
  '&': '&',
  '%': '%',
  $: '$',
  '#': '#',
  _: '_',
  '{': '{',
  '}': '}',
};

const ACCENTS: Record<string, string> = {
  "'": '́',
  '`': '̀',
  '^': '̂',
  '"': '̈',
  '~': '̃',
  '=': '̄',
  '.': '̇',
  c: '̧',
  v: '̌',
  u: '̆',
  H: '̋',
  k: '̨',
  r: '̊',
};

const MATH: Record<string, string> = {
  leq: '≤',
  le: '≤',
  geq: '≥',
  ge: '≥',
  neq: '≠',
  ne: '≠',
  approx: '≈',
  equiv: '≡',
  times: '×',
  cdot: '·',
  div: '÷',
  pm: '±',
  to: '→',
  rightarrow: '→',
  leftarrow: '←',
  Rightarrow: '⇒',
  Leftarrow: '⇐',
  Leftrightarrow: '⇔',
  iff: '⇔',
  implies: '⇒',
  mapsto: '↦',
  in: '∈',
  notin: '∉',
  ni: '∋',
  subset: '⊂',
  subseteq: '⊆',
  supset: '⊃',
  supseteq: '⊇',
  cup: '∪',
  cap: '∩',
  setminus: '∖',
  emptyset: '∅',
  varnothing: '∅',
  forall: '∀',
  exists: '∃',
  neg: '¬',
  lnot: '¬',
  land: '∧',
  wedge: '∧',
  lor: '∨',
  vee: '∨',
  oplus: '⊕',
  infty: '∞',
  sum: '∑',
  prod: '∏',
  int: '∫',
  partial: '∂',
  nabla: '∇',
  circ: '∘',
  star: '⋆',
  ast: '∗',
  bullet: '∙',
  dagger: '†',
  checkmark: '✓',
  ldots: '…',
  cdots: '⋯',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  varepsilon: 'ε',
  theta: 'θ',
  lambda: 'λ',
  mu: 'μ',
  pi: 'π',
  sigma: 'σ',
  tau: 'τ',
  phi: 'φ',
  varphi: 'φ',
  omega: 'ω',
  Gamma: 'Γ',
  Delta: 'Δ',
  Theta: 'Θ',
  Lambda: 'Λ',
  Pi: 'Π',
  Sigma: 'Σ',
  Phi: 'Φ',
  Omega: 'Ω',
  log: 'log',
  ln: 'ln',
  lg: 'lg',
  max: 'max',
  min: 'min',
  mod: 'mod',
  bmod: 'mod',
  lfloor: '⌊',
  rfloor: '⌋',
  lceil: '⌈',
  rceil: '⌉',
  langle: '⟨',
  rangle: '⟩',
  mid: '∣',
  vert: '|',
  '{': '{',
  '}': '}',
  ',': ' ',
  ';': ' ',
  ' ': ' ',
};

const BLACKBOARD: Record<string, string> = { N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ', P: 'ℙ' };

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const decodeHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Remove % comments (but not \%), including the line break they swallow. */
function stripComments(source: string): string {
  return source.replace(/(^|[^\\])%.*$/gm, '$1');
}

/** Index of the brace matching the opening brace at `open`, or -1. */
function matchBrace(text: string, open: number, openChar = '{', closeChar = '}'): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Split on a delimiter that is not escaped and not inside braces. */
function splitTopLevel(text: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let envDepth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') {
      if (text.startsWith('\\begin{', i)) envDepth++;
      else if (text.startsWith('\\end{', i)) envDepth--;
      if (delimiter === '\\\\' && text.startsWith('\\\\', i) && depth === 0 && envDepth === 0) {
        parts.push(text.slice(start, i));
        i++;
        // Skip an optional spacing argument: \\[4pt]
        const rest = text.slice(i + 1);
        const spacing = /^\s*\[[^\]]*\]/.exec(rest);
        start = i + 1 + (spacing ? spacing[0].length : 0);
        i = start - 1;
        continue;
      }
      i++;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (depth === 0 && envDepth === 0 && text.startsWith(delimiter, i) && delimiter !== '\\\\') {
      parts.push(text.slice(start, i));
      start = i + delimiter.length;
      i = start - 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Split list content into items at top-level \item commands. */
function splitItems(content: string): Array<{ label?: string; body: string }> {
  const items: Array<{ label?: string; body: string }> = [];
  let depth = 0;
  let envDepth = 0;
  let current: { label?: string; start: number } | null = null;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '\\') {
      if (content.startsWith('\\begin{', i)) envDepth++;
      else if (content.startsWith('\\end{', i)) envDepth--;
      else if (depth === 0 && envDepth === 0 && /^\\item(?![a-zA-Z])/.test(content.slice(i, i + 6))) {
        if (current) items.push({ label: current.label, body: content.slice(current.start, i) });
        let j = i + 5;
        let label: string | undefined;
        const after = content.slice(j);
        const optional = /^\s*\[/.exec(after);
        if (optional) {
          const open = j + optional[0].length - 1;
          const close = matchBrace(content, open, '[', ']');
          if (close !== -1) {
            label = content.slice(open + 1, close);
            j = close + 1;
          }
        }
        current = { label, start: j };
        i = j - 1;
        continue;
      }
      i++;
    }
  }
  if (current) items.push({ label: current.label, body: content.slice(current.start) });
  return items;
}

export function convertModuleDescription(
  source: string,
  options: { file?: string; warn?: (message: string) => void } = {},
): ConvertedModule {
  const file = options.file ?? 'module description';
  const reported = new Set<string>();
  const warn = (message: string) => {
    if (reported.has(message)) return;
    reported.add(message);
    options.warn?.(`${file}: ${message}`);
  };

  const text = stripComments(source.replace(/\r\n?/g, '\n'));

  // ---------- macros (\newcommand{\Name}{value}) ----------
  const macros = new Map<string, string>();
  const macroPattern = /\\(?:re)?newcommand\*?\s*\{?\\([a-zA-Z]+)\}?\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = macroPattern.exec(text))) {
    const open = match.index + match[0].length - 1;
    const close = matchBrace(text, open);
    if (close === -1) continue;
    macros.set(match[1], text.slice(open + 1, close).trim());
    macroPattern.lastIndex = close + 1;
  }

  // ---------- inline conversion ----------
  function inline(src: string, mode: 'text' | 'math' = 'text'): string {
    let out = '';
    let i = 0;
    const readGroup = (): string | null => {
      // Only consume leading whitespace when a group actually follows.
      const lead = /^[ \n]*\{/.exec(src.slice(i));
      if (!lead) return null;
      i += lead[0].length - 1;
      const close = matchBrace(src, i);
      const end = close === -1 ? src.length : close;
      const content = src.slice(i + 1, end);
      i = end + 1;
      return content;
    };
    const readOptional = (): string | null => {
      const m = /^\s*\[/.exec(src.slice(i));
      if (!m) return null;
      const open = i + m[0].length - 1;
      const close = matchBrace(src, open, '[', ']');
      if (close === -1) return null;
      i = close + 1;
      return src.slice(open + 1, close);
    };

    while (i < src.length) {
      const ch = src[i];

      if (ch === '\\') {
        const next = src[i + 1] ?? '';
        if (next === '\\') {
          i += 2;
          readOptional();
          out += mode === 'math' ? ' ' : '<br>';
          continue;
        }
        if (/[a-zA-Z@]/.test(next)) {
          const nameMatch = /^[a-zA-Z@]+\*?/.exec(src.slice(i + 1));
          const name = nameMatch ? nameMatch[0] : next;
          i += 1 + name.length;

          // As in TeX, a control word swallows the spaces that follow it
          // ("\ldots\ and" or "\ldots{} and" keep one).
          const skipSpace = () => {
            const m = /^[ \t]*\n?[ \t]*/.exec(src.slice(i));
            if (m) i += m[0].length;
          };

          if (macros.has(name)) {
            out += inline(macros.get(name) ?? '', mode);
            skipSpace();
            continue;
          }
          if (mode === 'math') {
            if (name === 'mathbb') {
              const g = readGroup() ?? '';
              out += escapeHtml(BLACKBOARD[g.trim()] ?? g);
              continue;
            }
            if (['mathrm', 'text', 'mathit', 'mathbf', 'operatorname', 'mathcal'].includes(name)) {
              out += inline(readGroup() ?? '', name === 'text' ? 'text' : 'math');
              continue;
            }
            if (name === 'frac') {
              const a = inline(readGroup() ?? '', 'math');
              const b = inline(readGroup() ?? '', 'math');
              out += `${a}/${b}`;
              continue;
            }
            if (name === 'sqrt') {
              out += `√(${inline(readGroup() ?? '', 'math')})`;
              continue;
            }
            if (name === 'left' || name === 'right' || name === 'big' || name === 'Big') continue;
            if (MATH[name] !== undefined) {
              out += escapeHtml(MATH[name]);
              continue;
            }
          }
          switch (name) {
            case 'textbf':
            case 'mathbf':
              out += `<strong>${inline(readGroup() ?? '', mode)}</strong>`;
              continue;
            case 'textit':
            case 'emph':
            case 'textsl':
            case 'mathit':
              out += `<em>${inline(readGroup() ?? '', mode)}</em>`;
              continue;
            case 'texttt':
              out += `<code>${inline(readGroup() ?? '', mode)}</code>`;
              continue;
            case 'textsc':
              out += `<span class="small-caps">${inline(readGroup() ?? '', mode)}</span>`;
              continue;
            case 'underline':
            case 'textrm':
            case 'textsf':
            case 'textnormal':
            case 'textup':
            case 'mbox':
            case 'hbox':
              out += inline(readGroup() ?? '', mode);
              continue;
            case 'textsuperscript':
              out += `<sup>${inline(readGroup() ?? '', mode)}</sup>`;
              continue;
            case 'textsubscript':
              out += `<sub>${inline(readGroup() ?? '', mode)}</sub>`;
              continue;
            case 'footnote':
              out += ` (${inline(readGroup() ?? '', mode)})`;
              continue;
            case 'href': {
              const url = (readGroup() ?? '').trim().replace(/\\([#%&_~])/g, '$1');
              const label = inline(readGroup() ?? '', mode);
              out += link(url, label);
              continue;
            }
            case 'url': {
              const url = (readGroup() ?? '').trim().replace(/\\([#%&_~])/g, '$1');
              out += link(url, escapeHtml(url));
              continue;
            }
            case 'bfseries':
            case 'itshape':
            case 'em':
            case 'ttfamily':
              // Switches apply to the rest of the current group; the caller
              // renders groups with their content, so wrap what follows.
              {
                const rest = inline(src.slice(i), mode);
                const tag = name === 'bfseries' ? 'strong' : name === 'ttfamily' ? 'code' : 'em';
                out += `<${tag}>${rest}</${tag}>`;
                i = src.length;
              }
              continue;
            case 'multicolumn':
            case 'multirow': {
              readGroup();
              readGroup();
              out += inline(readGroup() ?? '', mode);
              continue;
            }
            case 'ref':
            case 'cite':
            case 'pageref':
              out += escapeHtml(`[${readGroup() ?? ''}]`);
              continue;
            case 'today':
              continue;
          }
          if (IGNORED_WITH_ARGS[name] !== undefined) {
            readOptional();
            for (let n = 0; n < IGNORED_WITH_ARGS[name]; n++) readGroup();
            continue;
          }
          if (IGNORED.has(name)) {
            skipSpace();
            continue;
          }
          if (SYMBOLS[name] !== undefined) {
            out += escapeHtml(SYMBOLS[name]);
            skipSpace();
            continue;
          }
          if (ACCENTS[name] !== undefined) {
            const base = readGroup() ?? src[i++] ?? '';
            out += escapeHtml((inlineText(base) + ACCENTS[name]).normalize('NFC'));
            continue;
          }
          warn(`unsupported command \\${name} (rendered as text)`);
          readOptional();
          let group: string | null;
          while ((group = readGroup()) !== null) out += inline(group, mode);
          continue;
        }
        // \ followed by a symbol
        if (ACCENTS[next] !== undefined && /[{a-zA-Z]/.test(src[i + 2] ?? '')) {
          i += 2;
          const base = src[i] === '{' ? (readGroup() ?? '') : (src[i++] ?? '');
          out += escapeHtml((inlineText(base) + ACCENTS[next]).normalize('NFC'));
          continue;
        }
        if (mode === 'math' && MATH[next] !== undefined) {
          out += escapeHtml(MATH[next]);
          i += 2;
          continue;
        }
        if (SYMBOLS[next] !== undefined) {
          out += escapeHtml(SYMBOLS[next]);
          i += 2;
          continue;
        }
        if (next === '(' || next === '[') {
          const closer = next === '(' ? '\\)' : '\\]';
          const end = src.indexOf(closer, i + 2);
          const body = src.slice(i + 2, end === -1 ? src.length : end);
          out += `<span class="math">${inline(body, 'math')}</span>`;
          i = end === -1 ? src.length : end + 2;
          continue;
        }
        i += 2;
        continue;
      }

      if (ch === '$' && mode === 'text') {
        const display = src[i + 1] === '$';
        const start = i + (display ? 2 : 1);
        const end = src.indexOf(display ? '$$' : '$', start);
        const body = src.slice(start, end === -1 ? src.length : end);
        out += `<span class="math">${inline(body, 'math')}</span>`;
        i = end === -1 ? src.length : end + (display ? 2 : 1);
        continue;
      }

      if (mode === 'math' && (ch === '^' || ch === '_')) {
        i++;
        let arg: string;
        if (src[i] === '{') arg = readGroup() ?? '';
        else if (src[i] === '\\') {
          const m = /^\\[a-zA-Z]+/.exec(src.slice(i));
          arg = m ? m[0] : src[i];
          i += arg.length;
        } else arg = src[i++] ?? '';
        const tag = ch === '^' ? 'sup' : 'sub';
        out += `<${tag}>${inline(arg, 'math')}</${tag}>`;
        continue;
      }

      if (ch === '{') {
        const close = matchBrace(src, i);
        const end = close === -1 ? src.length : close;
        out += inline(src.slice(i + 1, end), mode);
        i = end + 1;
        continue;
      }
      if (ch === '}') {
        i++;
        continue;
      }
      if (ch === '~') {
        out += mode === 'math' ? ' ' : '&nbsp;';
        i++;
        continue;
      }
      if (mode === 'text') {
        if (src.startsWith('---', i)) {
          out += '—';
          i += 3;
          continue;
        }
        if (src.startsWith('--', i)) {
          out += '–';
          i += 2;
          continue;
        }
        if (src.startsWith('``', i)) {
          out += '“';
          i += 2;
          continue;
        }
        if (src.startsWith("''", i)) {
          out += '”';
          i += 2;
          continue;
        }
        if (ch === '`') {
          out += '‘';
          i++;
          continue;
        }
        if (ch === "'") {
          out += '’';
          i++;
          continue;
        }
        if (ch === '"') {
          // Straight double quotes: open after whitespace or at the start.
          out += i === 0 || /[\s(\[{]/.test(src[i - 1]) ? '“' : '”';
          i++;
          continue;
        }
      }
      if (ch === '\n' || ch === '\t') {
        out += ' ';
        i++;
        continue;
      }
      out += escapeHtml(ch);
      i++;
    }
    return out.replace(/ {2,}/g, ' ');
  }

  function inlineText(src: string): string {
    return decodeHtml(inline(src)).trim();
  }

  function link(url: string, label: string): string {
    if (/^(https?:|mailto:)/i.test(url)) {
      const external = /^https?:/i.test(url) && !/^https?:\/\/(www\.)?wosm\.academy(\/|$)/i.test(url);
      return `<a href="${escapeHtml(url)}"${external ? ' rel="noopener"' : ''}>${label}</a>`;
    }
    if (/^\/(?!\/)/.test(url)) return `<a href="${escapeHtml(url)}">${label}</a>`;
    warn(`link with unsupported address "${url}" (rendered as text)`);
    return label;
  }

  // ---------- block conversion ----------
  const headings: ConvertedModule['headings'] = [];
  const tables: Array<{ header: string[]; rows: string[][] }> = [];

  function findEnvEnd(src: string, name: string, from: number): { contentEnd: number; end: number } {
    const pattern = new RegExp(`\\\\(begin|end)\\{${name.replace(/[*]/g, '\\*')}\\}`, 'g');
    pattern.lastIndex = from;
    let depth = 1;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(src))) {
      depth += m[1] === 'begin' ? 1 : -1;
      if (depth === 0) return { contentEnd: m.index, end: m.index + m[0].length };
    }
    warn(`missing \\end{${name}}`);
    return { contentEnd: src.length, end: src.length };
  }

  function blocks(src: string): string {
    let out = '';
    let paragraph = '';
    const flush = () => {
      const html = inline(paragraph).trim();
      if (html && html !== '<br>') out += `<p>${html.replace(/^(<br>\s*)+|(\s*<br>)+$/g, '')}</p>\n`;
      paragraph = '';
    };

    let i = 0;
    while (i < src.length) {
      // Blank line: paragraph break.
      const blank = /^\n[ \t]*\n\s*/.exec(src.slice(i));
      if (blank) {
        flush();
        i += blank[0].length;
        continue;
      }

      const heading = /^\\(section|subsection|subsubsection|paragraph)(\*?)\s*\{/.exec(src.slice(i));
      if (heading) {
        flush();
        const open = i + heading[0].length - 1;
        const close = matchBrace(src, open);
        const titleHtml = inline(src.slice(open + 1, close)).trim();
        const textTitle = decodeHtml(titleHtml);
        const depth = { section: 2, subsection: 3, subsubsection: 4, paragraph: 4 }[heading[1]] ?? 2;
        let slug = slugify(textTitle);
        while (headings.some((h) => h.slug === slug)) slug += '-1';
        headings.push({ depth, slug, text: textTitle });
        out += `<h${depth} id="${slug}">${titleHtml}</h${depth}>\n`;
        i = close + 1;
        continue;
      }

      const env = /^\\begin\{([a-zA-Z*]+)\}/.exec(src.slice(i));
      if (env) {
        flush();
        const name = env[1];
        let j = i + env[0].length;
        // Arguments: tabularx{width}{spec}, tabular{spec}, optional [..] first.
        const args: string[] = [];
        let optional: string | undefined;
        const readOpt = () => {
          const m = /^[ \t]*\[/.exec(src.slice(j));
          if (!m) return;
          const open = j + m[0].length - 1;
          const close = matchBrace(src, open, '[', ']');
          if (close === -1) return;
          optional = src.slice(open + 1, close);
          j = close + 1;
        };
        const readArg = () => {
          const m = /^[ \t]*\{/.exec(src.slice(j));
          if (!m) return;
          const open = j + m[0].length - 1;
          const close = matchBrace(src, open);
          args.push(src.slice(open + 1, close));
          j = close + 1;
        };
        readOpt();
        const argCount = { tabularx: 2, 'tabular*': 2, tabular: 1, longtable: 1, tabulary: 2 }[name] ?? 0;
        for (let n = 0; n < argCount; n++) readArg();
        const { contentEnd, end } = findEnvEnd(src, name, j);
        const content = src.slice(j, contentEnd);
        out += environment(name, content, optional);
        i = end;
        continue;
      }

      // Display maths \[ … \]
      if (src.startsWith('\\[', i)) {
        flush();
        const end = src.indexOf('\\]', i + 2);
        out += `<p class="math-display"><span class="math">${inline(src.slice(i + 2, end === -1 ? src.length : end), 'math')}</span></p>\n`;
        i = end === -1 ? src.length : end + 2;
        continue;
      }

      paragraph += src[i];
      i++;
    }
    flush();
    return out;
  }

  function environment(name: string, content: string, optional?: string): string {
    switch (name) {
      case 'itemize':
      case 'enumerate': {
        const items = splitItems(content);
        const tag = name === 'itemize' ? 'ul' : 'ol';
        // enumitem labels such as [label=LO\arabic*.]
        const labelMatch = optional ? /label\s*=\s*(\{[^}]*\}|[^,\]]+)/.exec(optional) : null;
        const labelFormat = labelMatch ? labelMatch[1].replace(/^\{|\}$/g, '').trim() : undefined;
        const labelled = Boolean(labelFormat && /\\arabic\*/.test(labelFormat));
        const body = items
          .map((item, index) => {
            const inner = listItem(item.body);
            const label = item.label ?? (labelled && labelFormat ? labelFormat.replace(/\\arabic\*/, String(index + 1)) : undefined);
            return label !== undefined
              ? `<li><span class="item-label">${inline(label)}</span><div class="item-body">${inner}</div></li>`
              : `<li>${inner}</li>`;
          })
          .join('\n');
        const cls = labelled || items.some((it) => it.label !== undefined) ? ' class="labelled"' : '';
        return `<${tag}${cls}>\n${body}\n</${tag}>\n`;
      }
      case 'description': {
        const items = splitItems(content);
        return `<dl>\n${items.map((item) => `<dt>${inline(item.label ?? '')}</dt><dd>${listItem(item.body)}</dd>`).join('\n')}\n</dl>\n`;
      }
      case 'tabular':
      case 'tabularx':
      case 'tabular*':
      case 'tabulary':
      case 'longtable':
        return table(content);
      case 'quote':
      case 'quotation':
        return `<blockquote>\n${blocks(content)}</blockquote>\n`;
      case 'verbatim':
        return `<pre>${escapeHtml(content.replace(/^\n/, ''))}</pre>\n`;
      case 'center':
      case 'flushleft':
      case 'flushright':
      case 'minipage':
      case 'small':
      case 'footnotesize':
        return blocks(content);
      case 'equation':
      case 'equation*':
      case 'align':
      case 'align*':
      case 'displaymath':
        return `<p class="math-display"><span class="math">${inline(content.replace(/&/g, ''), 'math')}</span></p>\n`;
      case 'table':
        return blocks(content.replace(/\\caption\{[^}]*\}/, ''));
      default:
        warn(`unsupported environment ${name} (rendered as text)`);
        return blocks(content);
    }
  }

  function listItem(body: string): string {
    const html = blocks(body).trim();
    // A single paragraph inside an item is rendered without <p>.
    const single = /^<p>([\s\S]*)<\/p>$/.exec(html);
    return single && !single[1].includes('<p>') ? single[1] : html;
  }

  function table(content: string): string {
    // Find booktabs/hline rules to decide header and footer rows.
    const rowSources = splitTopLevel(content, '\\\\');
    type Row = { cells: Array<{ html: string; span: number }>; ruleBefore: boolean };
    const rows: Row[] = [];
    let pendingRule = false;
    let firstRuleSeen = false;
    let headerEnd = -1;
    for (const raw of rowSources) {
      let source = raw;
      const rules = source.match(/\\(toprule|midrule|bottomrule|hline|cmidrule(\{[^}]*\})?)/g) ?? [];
      for (const rule of rules) {
        if (rule === '\\toprule' || (rule === '\\hline' && rows.length === 0)) firstRuleSeen = true;
        else if ((rule === '\\midrule' || rule === '\\hline') && rows.length > 0) {
          if (headerEnd === -1 && firstRuleSeen) headerEnd = rows.length;
          pendingRule = true;
        }
      }
      source = source.replace(/\\(toprule|midrule|bottomrule|hline|addlinespace)(\[[^\]]*\])?/g, '').replace(/\\cmidrule(\([^)]*\))?\{[^}]*\}/g, '');
      if (!source.trim()) continue;
      const cells = splitTopLevel(source, '&').map((cell) => {
        const multi = /^\s*\\multicolumn\s*\{(\d+)\}\s*\{[^}]*\}\s*\{([\s\S]*)\}\s*$/.exec(cell);
        if (multi) return { html: inline(multi[2]).trim(), span: Number(multi[1]) };
        return { html: inline(cell).trim(), span: 1 };
      });
      rows.push({ cells, ruleBefore: pendingRule && rows.length > 0 && rows.length !== headerEnd });
      pendingRule = false;
    }
    if (rows.length === 0) return '';

    const head = headerEnd > 0 ? rows.slice(0, headerEnd) : [];
    const body = headerEnd > 0 ? rows.slice(headerEnd) : rows;
    tables.push({
      header: (head[0]?.cells ?? []).map((c) => decodeHtml(c.html)),
      rows: body.map((r) => r.cells.map((c) => decodeHtml(c.html))),
    });

    const cell = (tag: 'th' | 'td', c: { html: string; span: number }, scope?: string) => {
      // Header cells are bold already; drop a redundant \textbf around the whole cell.
      const html = tag === 'th' ? c.html.replace(/^<strong>([\s\S]*)<\/strong>$/, '$1') : c.html;
      return `<${tag}${c.span > 1 ? ` colspan="${c.span}"` : ''}${scope ? ` scope="${scope}"` : ''}>${html}</${tag}>`;
    };
    let html = '<div class="table-wrap"><table>\n';
    if (head.length) {
      html += `<thead>\n${head.map((r) => `<tr>${r.cells.map((c) => cell('th', c, 'col')).join('')}</tr>`).join('\n')}\n</thead>\n`;
    }
    html += '<tbody>\n';
    html += body
      .map((r) => `<tr${r.ruleBefore ? ' class="rule-before"' : ''}>${r.cells.map((c) => cell('td', c)).join('')}</tr>`)
      .join('\n');
    html += '\n</tbody>\n</table></div>\n';
    return html;
  }

  // ---------- document ----------
  const beginDoc = text.indexOf('\\begin{document}');
  const endDoc = text.indexOf('\\end{document}');
  let body = text.slice(beginDoc === -1 ? 0 : beginDoc + '\\begin{document}'.length, endDoc === -1 ? text.length : endDoc);
  const firstSection = body.search(/\\section\*?\s*\{/);
  if (firstSection > 0) body = body.slice(firstSection);
  else if (firstSection === -1) warn('no \\section found; nothing to show');

  let html = blocks(body);
  // Highlight owner placeholders, as in Markdown (src/lib/markdown/plugins.mjs).
  html = html.replace(/TODO\(owner\)[^<]*/g, (m) => `<mark class="todo">${m}</mark>`);

  // ---------- metadata ----------
  const meta: Partial<ModuleMeta> = {};
  for (const [macro, key] of Object.entries(META_MACROS)) {
    const value = macros.get(macro);
    if (value !== undefined && key !== 'hours' && key !== 'creditsValue') {
      (meta as Record<string, unknown>)[key] = inlineText(value);
    }
  }
  if (meta.credits) {
    const number = /^\s*(\d+(?:[.,]\d+)?)/.exec(meta.credits);
    if (number) meta.creditsValue = Number(number[1].replace(',', '.'));
  }
  const hoursTable = tables.find((t) => {
    const col = t.header.findIndex((h) => /^hours?$/i.test(h.trim()));
    return col > 0;
  });
  if (hoursTable) {
    const col = hoursTable.header.findIndex((h) => /^hours?$/i.test(h.trim()));
    const rows = hoursTable.rows.filter((r) => r.length > col).map((r) => ({ activity: r[0].trim(), hours: r[col].trim() }));
    const totalRow = rows.find((r) => /^total$/i.test(r.activity));
    const total = totalRow?.hours;
    const totalNumber = total && /^\d+(?:[.,]\d+)?$/.test(total) ? Number(total.replace(',', '.')) : undefined;
    meta.hours = {
      rows: rows.filter((r) => r !== totalRow),
      total,
      totalValue: totalNumber,
    };
  }
  if (!meta.title) warn('missing \\ModuleTitle');
  if (!meta.code) warn('missing \\ModuleCode');

  return {
    meta: { ...meta, title: meta.title ?? 'Untitled module', code: meta.code ?? '' } as ModuleMeta,
    html,
    headings,
  };
}
