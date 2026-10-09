// Content loader for module descriptions written in LaTeX.
// Every `*.tex` file in the folder becomes one entry (files starting with "_",
// such as the template, are skipped). The converted HTML is stored as the
// entry's rendered content, so pages can use `render(entry)` like Markdown.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';
import { convertModuleDescription } from './latex';

export function moduleDescriptionLoader(options: { base: string }): Loader {
  return {
    name: 'wosm-module-description-loader',
    load: async ({ store, parseData, generateDigest, logger, watcher, config }) => {
      const rootDir = fileURLToPath(config.root);
      const dir = path.resolve(rootDir, options.base);
      const relative = (file: string) => path.relative(rootDir, file);
      const isDescription = (file: string) =>
        path.dirname(file) === dir && file.endsWith('.tex') && !path.basename(file).startsWith('_');

      const sync = async (file: string) => {
        const source = await readFile(file, 'utf8');
        const id = path.basename(file, '.tex');
        const filePath = relative(file);
        const { meta, html, headings } = convertModuleDescription(source, {
          file: filePath,
          warn: (message) => logger.warn(message),
        });
        const data = await parseData({ id, data: { ...meta }, filePath });
        store.set({
          id,
          data,
          body: source,
          filePath,
          digest: generateDigest(source),
          rendered: { html, metadata: { headings } },
        });
      };

      store.clear();
      let files: string[] = [];
      try {
        files = (await readdir(dir)).map((name) => path.join(dir, name)).filter(isDescription);
      } catch {
        logger.warn(`${relative(dir)} not found; no module descriptions loaded`);
      }
      await Promise.all(files.map(sync));

      // Reload descriptions as they are edited in `astro dev`.
      watcher?.add(dir);
      const onChange = async (file: string) => {
        if (!isDescription(file)) return;
        await sync(file);
        logger.info(`Reloaded ${relative(file)}`);
      };
      watcher?.on('change', onChange);
      watcher?.on('add', onChange);
      watcher?.on('unlink', (file: string) => {
        if (isDescription(file)) store.delete(path.basename(file, '.tex'));
      });
    },
  };
}
