# Background simulation

A quiet, low-opacity **Conway's Game of Life** runs behind every page. It is decorative and thematic: in Life, isolated cells starve and cells in company survive, which is the Academy's metaphor. The logo glider comes from the same world.

The simulation must never hurt readability, accessibility, battery life or page performance.

---

## 1. Rendering

- One `<canvas id="bg-sim" aria-hidden="true">` fixed to the viewport (`position: fixed; inset: 0; z-index: -1; pointer-events: none`).
- Scale for `devicePixelRatio`, capped at 2.
- Cell colour from CSS token `--sim-cell`, drawn at low alpha:
  - light theme: ~0.07
  - dark theme: ~0.09
  - Tune by eye; text contrast must be unaffected.
- Optional fade: dying cells fade out over 2–3 generations (store an age/intensity byte per cell). This looks softer than hard blinking.
- **Readability mask:** behind the central content column, cells are drawn fainter (≈ 40% of normal alpha). Implement with a CSS `mask-image` on the canvas (a horizontal linear gradient that dips in the centre on wide screens) or by modulating alpha per column in the draw loop. On narrow screens (< 768 px), use a uniform lower alpha instead.
- Listen for the `themechange` event (dispatched by the theme toggle) and `prefers-color-scheme` changes; re-read colours.

## 2. Grid and rules

- Standard B3/S23 rules on a **toroidal** (wrap-around) grid.
- Cell size: 10 CSS px on desktop, 14 CSS px on screens < 768 px (fewer cells, less work).
- Cap grid at roughly 240 × 140 cells; if the viewport is larger, increase cell size.
- Double-buffered `Uint8Array`s; no per-frame allocations.
- Resize: debounce (~200 ms), rebuild the grid, reseed.

## 3. Seeding and lifecycle

- Initial seed: random fill at ~15% density **plus** 3–6 gliders at random positions and orientations (so the logo pattern visibly appears).
- Detect stagnation: keep a hash of the last ~6 generations' states; if a repeat is found (still life or short oscillator), or population falls below ~2% of cells, or after ~2,000 generations, reseed gradually by sprinkling new random patches or gliders, rather than snapping to a new random board.
- Speed: ~8 generations per second. Use `requestAnimationFrame` with a time accumulator, not `setInterval`.

## 4. Respecting the user and the device

- **`prefers-reduced-motion: reduce`** → compute ~40 generations off-screen and render one **static** frame; no animation.
- **Page hidden** (`visibilitychange`) → pause; resume on return.
- **Pause control** in the footer: a small mono caption that doubles as a button, e.g.
  `bg: Conway's Game of Life · gen 4,812 · [pause]` → `[play]`.
  Remember the choice in `localStorage` (try/catch; key `wosm:sim-paused`). The generation counter updates at most once per second, and only while visible.
  - Implementation note: because the visible label changes (`pause` ↔ `play`), the button does **not** use
    `aria-pressed` — a toggle button must keep a constant label, and a constant accessible name that differs from the
    visible word would fail WCAG 2.5.3 (Label in Name). The accessible name is the visible word plus
    “background animation”, e.g. “pause background animation”.
  - Under reduced motion the still frame is shown and the button reads `[play]`; pressing it is an explicit opt-in for
    that page only.
- Without JS, the canvas is simply absent (render it from the script, or hide it with a `no-js` class). The page background is the plain `--bg` colour.
- Never block the main thread for more than a few ms per frame; profile on a mid-range phone (Chrome DevTools, 4× CPU throttle).

## 5. Code structure

```
src/lib/simulation/
├── engine.ts      # canvas setup, DPR, resize, RAF loop, visibility, reduced motion, pause, theme colours
├── life.ts        # grid, step(), seed(), patterns (glider), stagnation detection
└── index.ts       # init(): picks the simulation for the current page and starts the engine
```

Keep a small `Simulation` interface (`init(w, h)`, `step()`, `draw(ctx, style)`, `name`) so other simulations can be added later (e.g. Langton's Ant, elementary CA Rule 110, Gray–Scott reaction-diffusion) and selected per page via a `data-sim` attribute on `<body>`. At launch, implement **only Life**.

Load the script with `type="module"` at the end of the body; it must not delay first paint.

## 6. Acceptance checks

Checked on 5 October 2026 (headless Chrome + Node): a generation of the 240 × 140 grid takes ~0.4 ms on a laptop;
reduced motion shows a still frame at generation 40; hiding the page stops the loop; pause persists across reloads;
the theme toggle recolours cells immediately; no canvas without JS. The text-contrast check was done by calculation
(worst case: a cell at full alpha behind text; see `DESIGN.md` §3). Still to do on real hardware: scrolling jank on a
mid-range phone.

- [ ] Text contrast in both themes is identical with the simulation on or off (measure).
- [ ] No visible jank when scrolling on a mid-range phone.
- [ ] Reduced motion shows a still frame.
- [ ] Switching tabs pauses it (CPU drops to ~0).
- [ ] Pause/play works with the keyboard and is announced properly (it's a `<button>` whose accessible name follows its visible label; see the note in §4).
- [ ] Theme toggle recolours cells immediately.
- [ ] Gliders are visible in the seed.
