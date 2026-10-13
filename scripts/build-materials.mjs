// Compiles the course materials (materials/<course>/<folder>/*.tex, except
// "_" files) with pdflatex, using the WoSM classes in materials/templates/.
// The PDFs are written next to their sources and committed.
//
//   npm run materials                 # everything
//   npm run materials -- lecture-01   # only files whose path contains "lecture-01"
//
// Slides (wosm-slides) give <name>.pdf and the print version <name>-handout.pdf.
// Sheets (wosm-article) give <name>.pdf and <name>-solutions.pdf.
// LaTeX's temporary files go to a scratch folder, not into the repository.

import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const materials = path.join(root, 'materials');
const templates = path.join(materials, 'templates');
const filter = process.argv[2];

const files = readdirSync(materials, { recursive: true })
  .filter((f) => f.endsWith('.tex') && !path.basename(f).startsWith('_'))
  .map((f) => path.join(materials, f))
  .filter((f) => !f.startsWith(templates + path.sep))
  .filter((f) => !filter || path.relative(materials, f).includes(filter))
  .sort();

if (spawnSync('pdflatex', ['--version']).error) {
  console.error('pdflatex not found. Install a TeX distribution (e.g. MacTeX or TeX Live).');
  process.exit(1);
}

// The classes are found through TEXINPUTS; the trailing delimiter keeps the default path.
const env = { ...process.env, TEXINPUTS: `${templates}//${path.delimiter}${process.env.TEXINPUTS ?? ''}` };
const scratch = mkdtempSync(path.join(tmpdir(), 'wosm-materials-'));

// Each .tex gives two PDFs: the plain one and a variant selected by job name.
function jobs(file) {
  const name = path.basename(file, '.tex');
  const cls = readFileSync(file, 'utf8').match(/\\documentclass(?:\[[^\]]*\])?\{([^}]+)\}/)?.[1];
  const plain = { job: name, input: `${name}.tex` };
  if (cls === 'wosm-slides')
    return [plain, { job: `${name}-handout`, input: `\\PassOptionsToClass{handout}{wosm-slides}\\input{${name}}` }];
  if (cls === 'wosm-article') return [plain, { job: `${name}-solutions`, input: `${name}.tex` }];
  return [plain];
}

let total = 0;
let failed = 0;
for (const file of files) {
  const dir = path.dirname(file);
  for (const { job, input } of jobs(file)) {
    total++;
    let ok = true;
    // Twice, so the outline, frame numbers and page references settle.
    for (let pass = 0; pass < 2 && ok; pass++) {
      const run = spawnSync(
        'pdflatex',
        ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${scratch}`, `-jobname=${job}`, input],
        { cwd: dir, env, encoding: 'utf8' },
      );
      ok = run.status === 0;
      if (!ok) {
        const error = (run.stdout ?? '').split('\n').filter((l) => l.startsWith('!') || /^l\.\d+/.test(l));
        console.error(`✗ ${path.relative(root, dir)}/${job}.pdf\n  ${error.slice(0, 4).join('\n  ')}`);
      }
    }
    if (ok) {
      copyFileSync(path.join(scratch, `${job}.pdf`), path.join(dir, `${job}.pdf`));
      console.log(`✓ ${path.relative(root, dir)}/${job}.pdf`);
    } else failed++;
  }
}
rmSync(scratch, { recursive: true, force: true });
console.log(`${total - failed} of ${total} compiled.`);
process.exit(failed ? 1 : 0);
