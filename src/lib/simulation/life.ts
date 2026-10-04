// Conway's Game of Life (B3/S23) on a toroidal grid.
// Double-buffered Uint8Arrays; nothing is allocated per generation.

import type { DrawStyle, Simulation } from './types';

const MAX_COLS = 240;
const MAX_ROWS = 140;
const CELL_DESKTOP = 10;
const CELL_MOBILE = 14;
const MOBILE_WIDTH = 768;

const SEED_DENSITY = 0.15;
const PATCH_DENSITY = 0.35;
/** Generations whose state hashes are remembered to detect still lifes and short oscillators. */
const HISTORY = 6;
/** Reseed gently after this many generations even if the board still looks busy. */
const MAX_GENERATIONS = 2000;
/** Reseed when fewer than this share of cells is alive. */
const MIN_POPULATION = 0.02;

/** Shade per cell: 3 = alive, 2 and 1 = recently died (fading), 0 = empty. */
const ALIVE = 3;
const SHADE_ALPHA = [0, 0.22, 0.5, 1];

/** The logo glider, travelling down and to the right. */
const GLIDER: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];

export class Life implements Simulation {
  readonly name = 'life';

  cols = 0;
  rows = 0;
  cellSize = CELL_DESKTOP;

  private cells = new Uint8Array(0);
  private next = new Uint8Array(0);
  private shade = new Uint8Array(0);
  private history = new Uint32Array(HISTORY);
  private historyLength = 0;
  private historyIndex = 0;
  private sinceReseed = 0;
  private readonly random: () => number;

  constructor(random: () => number = Math.random) {
    this.random = random;
  }

  init(width: number, height: number): void {
    const preferred = width < MOBILE_WIDTH ? CELL_MOBILE : CELL_DESKTOP;
    // Grow cells on very large screens so the grid stays within MAX_COLS × MAX_ROWS.
    this.cellSize = Math.max(preferred, Math.ceil(width / MAX_COLS), Math.ceil(height / MAX_ROWS));
    this.cols = Math.max(8, Math.ceil(width / this.cellSize));
    this.rows = Math.max(8, Math.ceil(height / this.cellSize));

    const size = this.cols * this.rows;
    this.cells = new Uint8Array(size);
    this.next = new Uint8Array(size);
    this.shade = new Uint8Array(size);
    this.seed();
  }

  /** Random soup at ~15% density plus 3–6 gliders with a little room around them. */
  seed(): void {
    const { cells } = this;
    for (let i = 0; i < cells.length; i++) cells[i] = this.random() < SEED_DENSITY ? 1 : 0;

    const gliders = 3 + Math.floor(this.random() * 4);
    for (let g = 0; g < gliders; g++) this.addGlider(4);

    this.syncShade();
    this.resetHistory();
  }

  step(): void {
    const { cols, rows, cells, next, shade } = this;
    let population = 0;
    let hash = 0x811c9dc5; // FNV-1a

    for (let y = 0; y < rows; y++) {
      const up = (y === 0 ? rows - 1 : y - 1) * cols;
      const row = y * cols;
      const down = (y === rows - 1 ? 0 : y + 1) * cols;

      for (let x = 0; x < cols; x++) {
        const left = x === 0 ? cols - 1 : x - 1;
        const right = x === cols - 1 ? 0 : x + 1;
        const i = row + x;
        const neighbours =
          cells[up + left] +
          cells[up + x] +
          cells[up + right] +
          cells[row + left] +
          cells[row + right] +
          cells[down + left] +
          cells[down + x] +
          cells[down + right];

        const alive = neighbours === 3 || (neighbours === 2 && cells[i] === 1) ? 1 : 0;
        next[i] = alive;
        population += alive;
        shade[i] = alive ? ALIVE : shade[i] > 0 ? shade[i] - 1 : 0;
        hash = Math.imul(hash ^ alive, 0x01000193);
      }
    }

    this.cells = next;
    this.next = cells;
    this.checkStagnation(population, hash >>> 0);
  }

  draw(ctx: CanvasRenderingContext2D, style: DrawStyle): void {
    const { cols, rows, shade, cellSize } = this;
    const gap = cellSize >= 12 ? 2 : 1;
    const size = cellSize - gap;

    ctx.fillStyle = style.color;
    // One path per shade level keeps this to three fill() calls per frame.
    for (let level = 1; level <= ALIVE; level++) {
      ctx.globalAlpha = style.alpha * SHADE_ALPHA[level];
      ctx.beginPath();
      for (let y = 0, i = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++, i++) {
          if (shade[i] === level) ctx.rect(x * cellSize, y * cellSize, size, size);
        }
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** Detect a dead or stuck board and revive it gradually rather than starting over. */
  private checkStagnation(population: number, hash: number): void {
    this.sinceReseed++;

    let repeated = false;
    for (let k = 0; k < this.historyLength; k++) {
      if (this.history[k] === hash) {
        repeated = true;
        break;
      }
    }
    this.history[this.historyIndex] = hash;
    this.historyIndex = (this.historyIndex + 1) % HISTORY;
    this.historyLength = Math.min(this.historyLength + 1, HISTORY);

    const total = this.cols * this.rows;
    if (population < total * MIN_POPULATION) {
      this.sprinkle(4 + Math.ceil(total / 4000), 2);
    } else if (repeated || this.sinceReseed >= MAX_GENERATIONS) {
      this.sprinkle(2 + Math.floor(this.random() * 3), 1 + Math.floor(this.random() * 2));
    }
  }

  /** Drop a few random patches and gliders onto the board. */
  private sprinkle(patches: number, gliders: number): void {
    for (let p = 0; p < patches; p++) {
      const w = 8 + Math.floor(this.random() * 9);
      const h = 8 + Math.floor(this.random() * 9);
      const x0 = Math.floor(this.random() * this.cols);
      const y0 = Math.floor(this.random() * this.rows);
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          if (this.random() < PATCH_DENSITY) this.set(x0 + dx, y0 + dy, 1);
        }
      }
    }
    for (let g = 0; g < gliders; g++) this.addGlider(2);

    this.syncShade();
    this.resetHistory();
  }

  /** Place a glider in a random orientation, clearing `margin` cells around it. */
  private addGlider(margin: number): void {
    const x0 = Math.floor(this.random() * this.cols);
    const y0 = Math.floor(this.random() * this.rows);
    const flipX = this.random() < 0.5;
    const flipY = this.random() < 0.5;

    for (let dy = -margin; dy < 3 + margin; dy++) {
      for (let dx = -margin; dx < 3 + margin; dx++) this.set(x0 + dx, y0 + dy, 0);
    }
    for (const [x, y] of GLIDER) this.set(x0 + (flipX ? 2 - x : x), y0 + (flipY ? 2 - y : y), 1);
  }

  private set(x: number, y: number, value: 0 | 1): void {
    const cx = ((x % this.cols) + this.cols) % this.cols;
    const cy = ((y % this.rows) + this.rows) % this.rows;
    this.cells[cy * this.cols + cx] = value;
  }

  private syncShade(): void {
    const { cells, shade } = this;
    for (let i = 0; i < cells.length; i++) if (cells[i]) shade[i] = ALIVE;
  }

  private resetHistory(): void {
    this.historyLength = 0;
    this.historyIndex = 0;
    this.sinceReseed = 0;
  }
}
