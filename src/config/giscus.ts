// giscus (GitHub Discussions) configuration for Journal comments and reactions.
// Generate the IDs at https://giscus.app (see docs/DEPLOYMENT.md §6).
// While `repoId` or `categoryId` is null, posts show a placeholder instead of
// loading giscus.

export const giscus = {
  repo: 'AliKhudiyev/wosm.academy',
  repoId: null as string | null,
  category: 'Journal',
  categoryId: null as string | null,
  mapping: 'pathname',
  reactionsEnabled: true,
  lang: 'en',
  themes: { light: 'light', dark: 'dark_dimmed' },
} as const;

export const giscusEnabled = Boolean(giscus.repoId && giscus.categoryId);
