# Deployment

The site is built by GitHub Actions and served by GitHub Pages at the apex domain **wosm.academy**. Moodle stays on the VPS at **moodle.wosm.academy**; nothing here changes it.

> Check the current GitHub Pages and Astro documentation before applying anything below. IPs and action versions can change.

---

## 1. Repository

- Public repository (e.g. `<owner>/wosm.academy`). GitHub Pages on a free account requires a public repo.
- Default branch `main`. Pages source: **GitHub Actions** (Settings → Pages → Build and deployment → Source).
  If the source is left on “Deploy from a branch”, GitHub also runs its own Jekyll build on every push
  (“pages build and deployment”), which fails on the `.astro` frontmatter (`Invalid YAML front matter in
  src/components/Footer.astro`). That failure is harmless but noisy; switching the source to GitHub Actions removes it.
- With the GitHub Actions source, `public/CNAME` is **ignored**: the custom domain must be set in Settings → Pages.
- Until the custom domain is set, the site is served under the owner's user-site domain at
  `alikhudiyev.com/wosm.academy/`, where its root-relative links and assets do not resolve. This is expected.

## 2. Astro config

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wosm.academy',
  // no `base` — served from the domain root
  integrations: [sitemap()],
});
```

`public/CNAME` contains exactly:
```
wosm.academy
```

## 3. Workflow

`.github/workflows/deploy.yml`: build on push to `main` (and `workflow_dispatch`) using the official `withastro/action`, then deploy with `actions/deploy-pages`. Use the template from Astro's "Deploy to GitHub Pages" guide, with `permissions: contents: read, pages: write, id-token: write` and a `concurrency` group so only one deploy runs at a time.

Add a separate check job (or step) for pull requests: `astro check`, build, and a link checker on `dist/` (e.g. `lychee` or `linkinator`), failing on broken internal links.

**As implemented:** one workflow, two jobs. `build` runs on every push and pull request: `npm ci` → `npm run check`
(astro check) → `npm run build` → `npm run linkcheck` (linkinator, internal links and `#fragments`, external links
skipped). On `main` and manual runs it uploads `dist/` with `actions/upload-pages-artifact@v5`; `deploy` then publishes
with `actions/deploy-pages@v5` (`pages: write`, `id-token: write`, concurrency group `pages`). This replaces
`withastro/action` so a failed check can never deploy. Node 24 in CI; `engines` requires ≥ 22.12.

## 4. DNS (at the domain registrar / DNS provider)

Registrar/DNS: **Porkbun**. As of 5 October 2026 the apex resolves to Porkbun's parking addresses (207.207.210.229,
207.207.210.107) and `www` is a CNAME to `pixie.porkbun.com` (Porkbun URL forwarding). Remove those records — and any
URL-forwarding entry in Porkbun — before adding the ones below.

Keep the existing `moodle` record (A → 62.171.139.18, the VPS). Add:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `alikhudiyev.github.io` |

Remove any old A/AAAA records on `@` that point elsewhere (e.g. to the VPS), or Pages will fail its DNS check.

If the zone has **CAA** records, ensure one allows `letsencrypt.org`, which GitHub uses for the HTTPS certificate.

Email records (MX, SPF, DKIM, DMARC) for `hello@`/`teach@` addresses are independent of the website and are configured with the email provider.

## 5. GitHub Pages settings

1. Settings → Pages → Custom domain: `wosm.academy` → Save. Wait for the DNS check to pass.
2. Tick **Enforce HTTPS** once the certificate is issued (can take up to ~1 hour).
3. **Verify the domain** for the account/organisation (Settings → Pages → Verified domains, which adds a TXT record). This prevents someone else from claiming the domain on GitHub if the Pages site is ever unpublished.

## 6. giscus (Journal comments and reactions)

1. Enable **Discussions** on the repository; create a category, e.g. "Journal" (announcement-type so only maintainers create threads).
2. Install the giscus GitHub app on the repo.
3. Generate the config at giscus.app; store `repo`, `repoId`, `category`, `categoryId` in a single config file (`src/config/giscus.ts`).
4. Mapping: `pathname`. Reactions enabled. Lazy load. Theme follows the site theme: post a `setConfig` message to the giscus iframe on `themechange`.

## 7. Placeholders the owner must provide

Track these in `TODO.md`:
- ~~GitHub username/organisation and repo name~~ — `AliKhudiyev/wosm.academy` (from the git remote)
- Discord invite URL
- Contact email addresses `hello@`, `teach@` are confirmed — check that email hosting exists for them
- Moodle course URLs (signup URL confirmed: `/login/signup.php`)
- giscus IDs
