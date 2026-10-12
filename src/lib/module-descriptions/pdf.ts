// Compiled module descriptions (PDF) committed next to their .tex files.
// They are published at /module-descriptions/<id>.pdf by
// src/pages/module-descriptions/[id].pdf.ts. Recompile with `npm run pdfs`.

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export const MODULE_DESCRIPTIONS_DIR = path.resolve(process.cwd(), 'src/content/module-descriptions');

/** Ids (file names without .pdf) of the published PDFs; "_" files are skipped. */
export function listModulePdfs(): string[] {
  try {
    return readdirSync(MODULE_DESCRIPTIONS_DIR)
      .filter((file) => file.endsWith('.pdf') && !file.startsWith('_'))
      .map((file) => file.slice(0, -'.pdf'.length));
  } catch {
    return [];
  }
}

export const hasModulePdf = (id: string) => existsSync(path.join(MODULE_DESCRIPTIONS_DIR, `${id}.pdf`));
export const modulePdfUrl = (id: string) => `/module-descriptions/${id}.pdf`;
