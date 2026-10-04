# Design specification

The site should feel like **a well-typeset university handbook that happens to have a terminal open in the background**. Calm, readable, serious, with small geeky details. Modern in its restraint, not in its effects.

---

## 1. Principles

1. **Reading first.** Most pages are text. Optimise for comfortable long-form reading on a phone.
2. **Soft, not stark.** Neither theme uses pure white or pure black. Contrast is sufficient (AA) but never harsh.
3. **Structure through typography and rules, not boxes.** Prefer headings, spacing, and thin horizontal rules over cards with shadows.
4. **One accent at a time.** Colour is used sparingly and meaningfully (links, the active state, subject markers).
5. **The background is alive but quiet.** The simulation should be noticed on the second look, not the first.

## 2. What to avoid (the "AI-generated look")

- Gradients, especially purple→blue or aurora/mesh gradients
- Glassmorphism, frosted panels, glows, neon
- Drop shadows on everything; rounded "pill" cards in 3-column grids with emoji or generic icons
- Giant centred hero headline + subheadline + two gradient buttons
- Stock illustrations, 3D blobs, abstract "AI brain" imagery, stock photos of smiling students
- Animated counters, testimonials carousels, logo walls, "trusted by"
- Marketing clichés in copy (see `CONTENT.md` → Voice)
- Icon libraries for decoration. Icons only where functional (theme toggle, menu, external link, Discord, GitHub, RSS).

## 3. Colour tokens

Define in `src/styles/tokens.css` as custom properties. Starting values below — **verify all text/background pairs meet WCAG AA** and adjust lightness if not.

### Light theme ("paper")

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f2eee5` | Page background (warm paper) |
| `--surface` | `#ebe6da` | Subtle raised areas, code blocks, table stripes |
| `--text` | `#2b2a27` | Body text (warm charcoal) |
| `--text-muted` | `#6b665c` | Metadata, captions |
| `--rule` | `#d6cfbf` | Borders, horizontal rules |
| `--accent` | `#1f6f6b` | Links, focus ring, primary button (deep teal) |
| `--accent-contrast` | `#f2eee5` | Text on accent |
| `--subject-cs` | `#1f6f6b` | Computer Science marker (teal) |
| `--subject-math` | `#9a4a2e` | Mathematics marker (brick) |
| `--sim-cell` | `#2b2a27` | Simulation cells (drawn at low alpha) |

### Dark theme ("slate")

| Token | Value | Use |
|---|---|---|
| `--bg` | `#1e2227` | Page background (soft slate) |
| `--surface` | `#262b31` | Raised areas |
| `--text` | `#d8d4cb` | Body text (warm off-white) |
| `--text-muted` | `#9a968d` | Metadata |
| `--rule` | `#363c44` | Borders |
| `--accent` | `#6bb8b0` | Links, focus, primary button |
| `--accent-contrast` | `#1e2227` | Text on accent |
| `--subject-cs` | `#6bb8b0` | |
| `--subject-math` | `#d9896a` | |
| `--sim-cell` | `#d8d4cb` | |

New subjects get a new `--subject-*` token; the subject's frontmatter references the token name.

### Theme behaviour

- Default: follow `prefers-color-scheme`.
- Toggle in the header (sun/moon icon button with accessible label) switches light ↔ dark and stores the choice in `localStorage` (wrapped in try/catch).
- Apply via `data-theme="light|dark"` on `<html>`, set by a tiny **inline blocking script in `<head>`** to avoid a flash of the wrong theme.
- Set `color-scheme` accordingly so form controls and scrollbars match.
- When the theme changes, dispatch a `themechange` event so the simulation can re-read its colours.

## 4. Typography

Self-host via `@fontsource` (variable versions where available).

| Role | Font | Notes |
|---|---|---|
| Body & headings | **Source Serif 4** | Readable serif; use optical sizing if available |
| Labels, nav, metadata, code, buttons | **JetBrains Mono** (or IBM Plex Mono) | The "geeky" accent — use small and sparingly |

- Base size: `1.0625rem` (17 px) mobile → `1.125rem` (18 px) desktop. Line height 1.6 for body.
- Fluid type scale with `clamp()`, ratio ~1.25. H1 is large but not billboard-sized (max ~2.75rem).
- Headings: serif, weight 600, tight line height (1.2), sentence case.
- Small-caps or mono uppercase with letter-spacing for eyebrow labels (e.g. `CS 101 · INTRODUCTORY`).
- Line length: max ~68ch for prose.
- Use real typographic characters: curly quotes, en/em dashes, `×`, non-breaking spaces before units.

## 5. Layout

- Single central column, max width ~68ch for prose, ~72rem for wide sections (catalogue grid, home subjects).
- Side gutter 16 px on mobile, growing to 32 px+.
- Generous vertical rhythm; sections separated by space and a thin `--rule`, not background bands.
- Grid: course list is a single column on mobile, two columns ≥ 768 px; avoid three-up card rows.
- The content column sits over the simulation; behind the prose column the simulation is masked fainter (see `SIMULATION.md`), so text remains effortless to read.

## 6. Components

- **Header:** wordmark left; nav right (`Courses · Join · Teach · About · Journal · Contact`); theme toggle; **Moodle** button (outlined, mono label `Moodle ↗` or `Log in to Moodle`). Under ~900 px collapse nav into a menu button that opens a full-width panel (works without JS via `<details>` fallback or a CSS-only pattern; enhance with JS). Current page indicated by an underline in accent colour + `aria-current="page"`.
- **Footer:** three short columns on desktop, stacked on mobile: (1) wordmark + "Wisdom of Starving Minds" + one-line mission; (2) links: FAQ, Code of Conduct, Licence, Privacy; (3) Discord, GitHub, RSS, email. Bottom line: © year, content licence note, and the simulation caption/pause control.
- **Buttons:** two kinds only — primary (accent fill, `--accent-contrast` text) and secondary (1px `--rule`/accent outline). Small radius (4 px). Mono font, no uppercase shouting.
- **Links:** accent colour, underline with offset; underline thickens on hover. External links get a small `↗`.
- **Course item:** title (serif), eyebrow with code + level in mono, one-line summary, meta row (duration · effort · status), subject marker as a 3 px left border in the subject colour. Whole item clickable, but with a real `<a>` on the title.
- **Status badge:** text-only mono label in brackets, e.g. `[open]`, `[upcoming]`, `[archived]` — playful-hacker but understated.
- **Callout:** left border + `--surface` background, for "Note" / "How to apply" boxes.
- **Focus ring:** 2 px solid `--accent`, 2 px offset, on everything focusable.
- **Tables:** for syllabi; thin rules, no zebra in dark mode beyond `--surface`.

## 7. Logo / wordmark

Design in SVG, hand-written path data where reasonable, single colour using `currentColor` so it follows the theme.

### Concept

A **glider** from Conway's Game of Life — five filled cells in a 3×3 grid — as the mark. It ties directly to the background simulation and to the name: in Life, isolated cells *starve*; cells survive in company. The glider is also the most recognisable pattern in Life, a thing that keeps moving forward. (It is also a known hacker emblem; that is fine and on-tone for the "rarely playful-hacker" side.)

Glider (phase used for the mark):
```
. ■ .
. . ■
■ ■ ■
```

### Deliverables

1. **Mark** — the glider: square cells with a small gap (gap ≈ 12–15% of cell size), optional very slight corner radius (≤ 1 px at 32 px). Works at 16 px (favicon) — check legibility.
2. **Wordmark** — `WoSM` set in Source Serif 4 semibold (or a lightly customised version), with `Academy` in JetBrains Mono, smaller, tracked out. Lowercase `o` in WoSM is part of the name and must stay lowercase.
3. **Horizontal lockup** — mark + wordmark, used in the header.
4. **Stacked lockup** — mark above wordmark, for the OG image and About page.
5. **Favicon** — `favicon.svg` (mark only, with a `prefers-color-scheme` media query inside the SVG for dark browser chrome) plus `apple-touch-icon.png` (180×180, mark on `--bg`).
6. **OG image** — 1200×630 PNG: paper background, faint Life pattern, stacked lockup, tagline.

### Process

Produce **three variations** of the mark/wordmark pairing (e.g. glider cells square vs. slightly rounded; wordmark serif-only vs. serif + mono; mark left vs. mark replacing the `o`), render them side by side in both themes on a temporary `/brand-preview` page, and ask the owner to choose before finalising. Delete the preview page afterwards.

## 8. Motion

- Page transitions: none (or Astro view transitions with a short cross-fade only, disabled under reduced motion).
- Hover: colour/underline changes only, ≤150 ms.
- The simulation is the only continuous motion on the site.

## 9. Imagery

- No stock photography. The only photo at launch is the founder's portrait on the About page (owner supplies it; placeholder until then — a neutral glider-patterned square, not a silhouette avatar).
- Diagrams, if any, are SVG and use the theme tokens.
