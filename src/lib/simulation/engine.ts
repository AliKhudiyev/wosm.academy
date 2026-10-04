// Runs a Simulation on a fixed, decorative background canvas.
// Handles device pixel ratio, resizing, the animation loop, page visibility,
// reduced motion, the footer pause control and theme colours.

import type { DrawStyle, Simulation } from './types';

const GENERATIONS_PER_SECOND = 8;
const STEP_MS = 1000 / GENERATIONS_PER_SECOND;
/** Steps computed before showing a still frame (reduced motion, or paused). */
const STILL_FRAME_GENERATIONS = 40;
const MAX_STEPS_PER_FRAME = 3;
const RESIZE_DEBOUNCE_MS = 200;
const CAPTION_INTERVAL_MS = 1000;
const MAX_DPR = 2;
const STORAGE_KEY = 'wosm:sim-paused';

export interface EngineControls {
  /** Footer caption; shown once the engine starts. */
  caption?: HTMLElement | null;
  /** Element whose text is the generation counter. */
  generation?: HTMLElement | null;
  /** Pause/play button. */
  toggle?: HTMLButtonElement | null;
  /** Element inside the button holding the visible "pause"/"play" word. */
  action?: HTMLElement | null;
}

export class Engine {
  private readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private style: DrawStyle = { color: '#000', alpha: 0.07 };
  private width = 0;
  private height = 0;
  private dpr = 1;

  private generation = 0;
  private paused = false;
  private frameId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private lastCaption = 0;
  private resizeTimer = 0;

  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly numberFormat = new Intl.NumberFormat('en-GB');

  constructor(
    private readonly sim: Simulation,
    private readonly controls: EngineControls = {},
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'bg-sim';
    this.canvas.setAttribute('aria-hidden', 'true');
  }

  start(): void {
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    document.body.prepend(this.canvas);

    this.paused = this.reducedMotion.matches || readPausedPreference();
    this.readStyle();
    this.resize();
    if (this.paused) this.advance(STILL_FRAME_GENERATIONS);
    this.render();

    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    document.addEventListener('themechange', this.onTheme);
    this.darkScheme.addEventListener('change', this.onTheme);
    this.reducedMotion.addEventListener('change', this.onReducedMotion);
    this.controls.toggle?.addEventListener('click', this.onToggle);

    if (this.controls.caption) this.controls.caption.hidden = false;
    this.updateControls();
    this.schedule();
  }

  // ---------- loop ----------

  private readonly frame = (now: number): void => {
    this.frameId = 0;
    if (!this.shouldRun()) return;

    if (this.lastTime === 0) this.lastTime = now;
    this.accumulator += Math.min(now - this.lastTime, 1000);
    this.lastTime = now;

    let steps = 0;
    while (this.accumulator >= STEP_MS && steps < MAX_STEPS_PER_FRAME) {
      this.sim.step();
      this.generation++;
      this.accumulator -= STEP_MS;
      steps++;
    }
    // Never try to catch up after a long stall.
    if (steps === MAX_STEPS_PER_FRAME) this.accumulator = 0;

    if (steps > 0) {
      this.render();
      if (now - this.lastCaption >= CAPTION_INTERVAL_MS) {
        this.lastCaption = now;
        this.updateCounter();
      }
    }
    this.frameId = requestAnimationFrame(this.frame);
  };

  private shouldRun(): boolean {
    return !this.paused && !document.hidden;
  }

  private schedule(): void {
    if (this.frameId || !this.shouldRun()) return;
    this.lastTime = 0;
    this.accumulator = 0;
    this.frameId = requestAnimationFrame(this.frame);
  }

  private stop(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  private advance(generations: number): void {
    for (let i = 0; i < generations; i++) this.sim.step();
    this.generation += generations;
  }

  // ---------- drawing ----------

  private render(): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.sim.draw(ctx, this.style);
  }

  private readStyle(): void {
    const computed = getComputedStyle(document.documentElement);
    const color = computed.getPropertyValue('--sim-cell').trim();
    const alpha = Number.parseFloat(computed.getPropertyValue('--sim-alpha'));
    this.style = { color: color || this.style.color, alpha: Number.isFinite(alpha) ? alpha : this.style.alpha };
  }

  /** Match the canvas to its CSS size; rebuild and reseed the grid when it changes. */
  private resize(): boolean {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (width === this.width && height === this.height && dpr === this.dpr) return false;

    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.sim.init(width, height);
    this.generation = 0;
    return true;
  }

  // ---------- events ----------

  private readonly onResize = (): void => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      if (!this.resize()) return;
      if (this.paused) this.advance(STILL_FRAME_GENERATIONS);
      this.render();
      this.updateCounter();
    }, RESIZE_DEBOUNCE_MS);
  };

  private readonly onVisibility = (): void => {
    if (document.hidden) this.stop();
    else {
      this.updateCounter();
      this.schedule();
    }
  };

  private readonly onTheme = (): void => {
    this.readStyle();
    this.render();
  };

  private readonly onReducedMotion = (): void => {
    this.paused = this.reducedMotion.matches || readPausedPreference();
    if (this.paused) this.stop();
    this.updateControls();
    this.schedule();
  };

  private readonly onToggle = (): void => {
    this.paused = !this.paused;
    writePausedPreference(this.paused);
    if (this.paused) this.stop();
    this.updateControls();
    this.schedule();
  };

  // ---------- footer caption ----------

  private updateControls(): void {
    if (this.controls.action) this.controls.action.textContent = this.paused ? 'play' : 'pause';
    this.updateCounter();
  }

  private updateCounter(): void {
    if (this.controls.generation && !document.hidden) {
      this.controls.generation.textContent = this.numberFormat.format(this.generation);
    }
  }
}

function readPausedPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writePausedPreference(paused: boolean): void {
  try {
    if (paused) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: the choice lasts for this page only */
  }
}
