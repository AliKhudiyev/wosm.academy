// Compiles the course materials (materials/<course>/**/*.tex, except "_"
// files) to PDFs next to them, using pdflatex and the shared classes in
// materials/latex/. Slides (wosm-slides) also get a print version,
// <name>-handout.pdf; exercise sheets (wosm-article) with solutions also get
// <name>-solutions.pdf. The PDFs are committed and uploaded to Moodle.
//
//   npm run materials                 # everything
//   npm run materials -- lecture-01   # only files whose path contains "lecture-01"
//
// LaTeX's temporary files go to a scratch folder, not into the repository.

import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'materials');
const classes = path.join(dir, 'latex');
const filter = process.argv[2];
const files = readdirSync(dir, { recursive: true })
  .filter((f) => f.endsWith('.tex') && !path.basename(f).startsWith('_'))
  .filter((f) => !path.join(dir, f).startsWith(classes + path.sep))
  .filter((f) => !filter || f.includes(filter))
  .sort();

if (spawnSync('pdflatex', ['--version']).error) {
  console.error('pdflatex not found. Install a TeX distribution (e.g. MacTeX or TeX Live).');
  process.exit(1);
}

// The versions to build from one source: [job name, TeX input].
function versions(file) {
  const name = path.basename(file, '.tex');
  const source = readFileSync(path.join(dir, file), 'utf8');
  const jobs = [[name, path.basename(file)]];
  if (/\\documentclass(\[[^\]]*\])?\{wosm-slides\}/.test(source))
    jobs.push([`${name}-handout`, `\\PassOptionsToClass{handout}{wosm-slides}\\input{${path.basename(file)}}`]);
  if (/\\documentclass(\[[^\]]*\])?\{wosm-article\}/.test(source) && source.includes('\\begin{solution}'))
    jobs.push([`${name}-solutions`, path.basename(file)]); // the class reads "-solutions" from the job name
  return jobs;
}

const scratch = mkdtempSync(path.join(tmpdir(), 'wosm-materials-'));
// The trailing separator keeps TeX's default search path after ours.
const env = { ...process.env, TEXINPUTS: `${classes}//${path.delimiter}` };
let total = 0;
let failed = 0;
for (const file of files) {
  const cwd = path.join(dir, path.dirname(file));
  for (const [job, input] of versions(file)) {
    total++;
    let ok = true;
    // Twice, so references, frame numbers and hyperref bookmarks settle.
    for (let pass = 0; pass < 2 && ok; pass++) {
      const run = spawnSync(
        'pdflatex',
        ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${scratch}`, `-jobname=${job}`, input],
        { cwd, env, encoding: 'utf8' },
      );
      ok = run.status === 0;
      if (!ok) {
        const error = (run.stdout ?? '').split('\n').filter((l) => l.startsWith('!') || /^l\.\d+/.test(l));
        console.error(`✗ ${path.join(path.dirname(file), job)}.pdf\n  ${error.slice(0, 4).join('\n  ')}`);
      }
    }
    if (ok) {
      copyFileSync(path.join(scratch, `${job}.pdf`), path.join(cwd, `${job}.pdf`));
      console.log(`✓ ${path.join(path.dirname(file), job)}.pdf`);
    } else failed++;
  }
}
rmSync(scratch, { recursive: true, force: true });
console.log(`${total - failed} of ${total} compiled.`);
process.exit(failed ? 1 : 0);
