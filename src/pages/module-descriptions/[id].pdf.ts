import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { listModulePdfs, MODULE_DESCRIPTIONS_DIR } from '../../lib/module-descriptions/pdf';

export const getStaticPaths: GetStaticPaths = () => listModulePdfs().map((id) => ({ params: { id } }));

export const GET: APIRoute = async ({ params }) => {
  const file = await readFile(path.join(MODULE_DESCRIPTIONS_DIR, `${params.id}.pdf`));
  return new Response(new Uint8Array(file), { headers: { 'Content-Type': 'application/pdf' } });
};
