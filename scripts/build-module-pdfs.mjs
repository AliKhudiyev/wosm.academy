// Compiles every module description (src/content/module-descriptions/*.tex,
// except "_" files) to a PDF next to it, using pdflatex. The PDFs are
// committed and published at /module-descriptions/<name>.pdf.
//
//   npm run pdfs              # all modules
//   npm run pdfs -- cs201     # only files whose name contains "cs201"
//
// LaTeX's temporary files go to a scratch folder, not into the repository.

import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src/content/module-descriptions');
const filter = process.argv[2];
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.tex') && !f.startsWith('_') && (!filter || f.includes(filter)))
  .sort();

if (spawnSync('pdflatex', ['--version']).error) {
  console.error('pdflatex not found. Install a TeX distribution (e.g. MacTeX or TeX Live).');
  process.exit(1);
}

const scratch = mkdtempSync(path.join(tmpdir(), 'wosm-pdfs-'));
let failed = 0;
for (const file of files) {
  const name = file.slice(0, -'.tex'.length);
  let ok = true;
  // Twice, so references and hyperref bookmarks settle.
  for (let pass = 0; pass < 2 && ok; pass++) {
    const run = spawnSync(
      'pdflatex',
      ['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${scratch}`, file],
      { cwd: dir, encoding: 'utf8' },
    );
    ok = run.status === 0;
    if (!ok) {
      const error = (run.stdout ?? '').split('\n').filter((l) => l.startsWith('!') || /^l\.\d+/.test(l));
      console.error(`✗ ${file}\n  ${error.slice(0, 4).join('\n  ')}`);
    }
  }
  if (ok) {
    copyFileSync(path.join(scratch, `${name}.pdf`), path.join(dir, `${name}.pdf`));
    console.log(`✓ ${name}.pdf`);
  } else failed++;
}
rmSync(scratch, { recursive: true, force: true });
console.log(`${files.length - failed} of ${files.length} compiled.`);
process.exit(failed ? 1 : 0);
