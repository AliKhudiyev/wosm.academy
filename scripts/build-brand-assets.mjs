// Generates the brand files from the logo definition and design tokens:
//
//   src/assets/brand/glider-mark.svg           mark only (currentColor)
//   src/assets/brand/logo-horizontal.svg       mark + wordmark, text outlined (currentColor)
//   src/assets/brand/logo-stacked.svg          stacked lockup, text outlined (currentColor)
//   public/favicon.svg                         mark, light/dark via prefers-color-scheme
//   public/favicon.ico                         16 + 32 px PNGs for old browsers
//   public/apple-touch-icon.png                180 × 180, mark on --bg
//   public/og-default.png                      1200 × 630 social card
//
// Run after changing the logo variant (src/config/brand.ts) or the tokens:
//   npm run brand

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => path.join(root, ...p);

// ---------- inputs ----------

const brandConfig = await readFile(r('src/config/brand.ts'), 'utf8');
const variant = /logoVariant: LogoVariant = '([abc])'/.exec(brandConfig)?.[1] ?? 'a';

const tokensCss = await readFile(r('src/styles/tokens.css'), 'utf8');
const lightBlock = tokensCss.slice(tokensCss.indexOf(':root,'), tokensCss.indexOf('}'));
const darkBlock = tokensCss.slice(tokensCss.indexOf(":root[data-theme='dark']"));
const token = (block, name) => {
  const match = new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`).exec(block);
  if (!match) throw new Error(`Token ${name} not found`);
  return match[1];
};
const light = { bg: token(lightBlock, '--bg'), text: token(lightBlock, '--text'), muted: token(lightBlock, '--text-muted') };
const dark = { text: token(darkBlock, '--text') };

const loadFont = async (file) => {
  const buffer = await readFile(r('node_modules', file));
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
};
const serif = await loadFont('@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff');
const serifRegular = await loadFont('@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff');
const mono = await loadFont('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff');

// ---------- helpers ----------

const GLIDER = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];

const n = (v) => Number(v.toFixed(2));

/** Serialise opentype.js path commands (its own toPathData() can emit "NaN"). */
function pathData(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        case 'Z':
          return 'Z';
        default:
          throw new Error(`Unknown path command ${c.type}`);
      }
    })
    .join('');
}

/** Glider rects at (x, y) with total size `size`; gap is 15% of a cell. */
function gliderRects(x, y, size, { rounded = variant === 'b' } = {}) {
  const cell = size / (3 + 2 * 0.15);
  const step = cell * 1.15;
  const rx = rounded ? ` rx="${n(cell * 0.1)}"` : '';
  return GLIDER.map(
    ([cx, cy]) => `<rect x="${n(x + cx * step)}" y="${n(y + cy * step)}" width="${n(cell)}" height="${n(cell)}"${rx}/>`,
  ).join('');
}

/** Outlined text; returns { d, width }. `tracking` is extra space per character in em. */
function outline(font, text, x, baseline, size, tracking = 0) {
  let cursor = x;
  let d = '';
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((glyph, i) => {
    d += pathData(glyph.getPath(cursor, baseline, size).commands);
    cursor += (glyph.advanceWidth / font.unitsPerEm) * size;
    if (i < glyphs.length - 1) {
      cursor += (font.getKerningValue(glyph, glyphs[i + 1]) / font.unitsPerEm) * size + tracking * size;
    }
  });
  return { d, width: cursor - x };
}

const capHeight = (font) => font.tables.os2.sCapHeight / font.unitsPerEm;
const xHeight = (font) => font.tables.os2.sxHeight / font.unitsPerEm;

/**
 * Lay out the logo for the chosen variant. Units: `f` is the logo font size
 * (mirrors the em-based sizes in src/components/Logo.astro).
 * Returns SVG inner markup using `fill` colours, plus its bounding box.
 */
function logo({ layout = 'horizontal', f = 40, x = 0, y = 0, nameFill, academyFill }) {
  const nameSize = 1.25 * f;
  const parts = [];
  let width;
  let height;

  if (layout === 'stacked') {
    const markSize = 2.2 * f;
    const stackedName = 2 * f;
    const academySize = 0.72 * f;
    parts.push(`<g fill="${nameFill}">${gliderRects(x, y, markSize)}</g>`);
    const nameBaseline = y + markSize + 0.6 * f + capHeight(serif) * stackedName;
    const name = outline(serif, 'WoSM', x, nameBaseline, stackedName);
    parts.push(`<path fill="${nameFill}" d="${name.d}"/>`);
    const academyBaseline = nameBaseline + 0.35 * f + capHeight(mono) * academySize + 0.25 * f;
    const academy = outline(mono, 'Academy', x, academyBaseline, academySize, 0.12);
    parts.push(`<path fill="${academyFill}" d="${academy.d}"/>`);
    width = Math.max(markSize, name.width, academy.width);
    height = academyBaseline - y + 0.25 * academySize;
    return { svg: parts.join(''), width, height };
  }

  const cap = capHeight(serif) * nameSize;
  const baseline = y + cap + 0.1 * f;

  if (variant === 'c') {
    const w = outline(serif, 'W', x, baseline, nameSize);
    const oSize = xHeight(serif) * nameSize;
    const oX = x + w.width + 0.06 * nameSize;
    const rects = gliderRects(oX, baseline - oSize, oSize, { rounded: false });
    const sm = outline(serif, 'SM', oX + oSize + 0.06 * nameSize, baseline, nameSize);
    const academyX = oX + oSize + 0.06 * nameSize + sm.width + 0.4 * f;
    const academy = outline(mono, 'Academy', academyX, baseline, 0.72 * f, 0.12);
    parts.push(`<path fill="${nameFill}" d="${w.d}${sm.d}"/><g fill="${nameFill}">${rects}</g>`);
    parts.push(`<path fill="${academyFill}" d="${academy.d}"/>`);
    return { svg: parts.join(''), width: academyX + academy.width - x, height: cap + 0.35 * f };
  }

  if (variant === 'b') {
    const markSize = 1.7 * f;
    parts.push(`<g fill="${nameFill}">${gliderRects(x, y, markSize)}</g>`);
    const textX = x + markSize + 0.45 * f;
    const nameBaseline = y + cap;
    const name = outline(serif, 'WoSM', textX, nameBaseline, nameSize);
    const academySize = 0.56 * f;
    const academy = outline(mono, 'ACADEMY', textX, y + markSize, academySize, 0.32);
    parts.push(`<path fill="${nameFill}" d="${name.d}"/><path fill="${academyFill}" d="${academy.d}"/>`);
    return { svg: parts.join(''), width: markSize + 0.45 * f + Math.max(name.width, academy.width), height: markSize };
  }

  // a — default
  const markSize = 1.05 * f;
  const markY = baseline - cap / 2 - markSize / 2;
  parts.push(`<g fill="${nameFill}">${gliderRects(x, markY, markSize)}</g>`);
  const nameX = x + markSize + 0.45 * f;
  const name = outline(serif, 'WoSM', nameX, baseline, nameSize);
  const academyX = nameX + name.width + 0.4 * f;
  const academy = outline(mono, 'Academy', academyX, baseline, 0.72 * f, 0.12);
  parts.push(`<path fill="${nameFill}" d="${name.d}"/><path fill="${academyFill}" d="${academy.d}"/>`);
  return { svg: parts.join(''), width: academyX + academy.width - x, height: cap + 0.35 * f };
}

const svgDoc = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(w)} ${n(h)}" width="${n(w)}" height="${n(h)}"${extra}>${body}</svg>\n`;

/** Deterministic PRNG so generated images are stable between runs. */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A few generations of Life on a torus, for the social card background. */
function lifePattern(cols, rows, generations, random) {
  let cells = new Uint8Array(cols * rows).map(() => (random() < 0.16 ? 1 : 0));
  for (let g = 0; g < generations; g++) {
    const next = new Uint8Array(cells.length);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) count += cells[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)];
          }
        }
        const alive = cells[y * cols + x];
        next[y * cols + x] = count === 3 || (alive && count === 2) ? 1 : 0;
      }
    }
    cells = next;
  }
  return cells;
}

function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

// ---------- outputs ----------

await mkdir(r('src/assets/brand'), { recursive: true });

// Mark (33 × 33 units, matches src/components/GliderMark.astro).
await writeFile(
  r('src/assets/brand/glider-mark.svg'),
  svgDoc(33, 33, `<g fill="currentColor">${gliderRects(0, 0, 33)}</g>`),
);

for (const layout of ['horizontal', 'stacked']) {
  const pad = 2;
  const { svg, width, height } = logo({ layout, x: pad, y: pad, nameFill: 'currentColor', academyFill: 'currentColor' });
  await writeFile(r(`src/assets/brand/logo-${layout}.svg`), svgDoc(width + 2 * pad, height + 2 * pad, svg));
}

// Favicon: pixel-snapped to a 16 px grid (4 px cells, 1 px gaps) so it stays crisp.
const faviconCells = GLIDER.map(
  ([cx, cy]) => `<rect x="${1 + cx * 5}" y="${1 + cy * 5}" width="4" height="4"${variant === 'b' ? ' rx="0.6"' : ''}/>`,
).join('');
const faviconSvg = (fill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g fill="${fill}">${faviconCells}</g></svg>`;
await writeFile(
  r('public/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><style>rect{fill:${light.text}}@media (prefers-color-scheme:dark){rect{fill:${dark.text}}}</style>${faviconCells}</svg>\n`,
);
const icoImages = [];
for (const size of [16, 32]) {
  icoImages.push({ size, png: await sharp(Buffer.from(faviconSvg(light.text)), { density: 72 * (size / 16) }).resize(size, size).png().toBuffer() });
}
await writeFile(r('public/favicon.ico'), ico(icoImages));

// Apple touch icon: mark on the paper background.
await sharp(
  Buffer.from(svgDoc(180, 180, `<rect width="180" height="180" fill="${light.bg}"/><g fill="${light.text}">${gliderRects(42, 42, 96)}</g>`)),
)
  .png()
  .toFile(r('public/apple-touch-icon.png'));

// Social card: paper, a faint Life pattern, stacked lockup, tagline.
{
  const W = 1200;
  const H = 630;
  const cell = 15;
  const cols = Math.ceil(W / cell);
  const rows = Math.ceil(H / cell);
  const random = mulberry32(1970); // 1970: Life's publication year in Scientific American
  const cells = lifePattern(cols, rows, 30, random);
  let pattern = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!cells[y * cols + x]) continue;
      // Fade the pattern out behind the text on the left.
      const t = Math.min(1, Math.max(0, (x * cell - 520) / 420));
      const alpha = 0.03 + 0.09 * t;
      pattern += `<rect x="${x * cell}" y="${y * cell}" width="${cell - 2}" height="${cell - 2}" fill-opacity="${n(alpha)}"/>`;
    }
  }
  const lockup = logo({ layout: 'stacked', f: 44, x: 96, y: 118, nameFill: light.text, academyFill: light.muted });
  const taglineBaseline = 118 + lockup.height + 92;
  const tagline = outline(serifRegular, 'Knowledge should not be rationed.', 96, taglineBaseline, 46);
  const url = outline(mono, 'wosm.academy', 96, taglineBaseline + 62, 22, 0.04);
  const body = [
    `<rect width="${W}" height="${H}" fill="${light.bg}"/>`,
    `<g fill="${light.text}">${pattern}</g>`,
    lockup.svg,
    `<path fill="${light.text}" d="${tagline.d}"/>`,
    `<path fill="${light.muted}" d="${url.d}"/>`,
  ].join('');
  await sharp(Buffer.from(svgDoc(W, H, body))).png({ compressionLevel: 9 }).toFile(r('public/og-default.png'));
}

console.log(`Brand assets generated (logo variant ${variant}).`);
