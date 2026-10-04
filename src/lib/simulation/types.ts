/** Colours and opacity the engine reads from CSS tokens for the current theme. */
export interface DrawStyle {
  /** Value of --sim-cell, e.g. "#2b2a27". */
  color: string;
  /** Value of --sim-alpha, e.g. 0.07. */
  alpha: number;
}

/**
 * A background simulation. The engine owns the canvas, timing and lifecycle;
 * a simulation only knows how to set itself up for a viewport size, advance
 * one step and draw itself.
 */
export interface Simulation {
  readonly name: string;
  /** Set up (or rebuild) for a viewport of `width` × `height` CSS pixels. */
  init(width: number, height: number): void;
  /** Advance by one generation. */
  step(): void;
  /** Draw the current state. The context is already scaled to CSS pixels and cleared. */
  draw(ctx: CanvasRenderingContext2D, style: DrawStyle): void;
}
