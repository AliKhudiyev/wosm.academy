// Entry point for the decorative background simulation.
// A page can choose a simulation with <body data-sim="…"> ("none" turns it off).
// Only Conway's Game of Life exists at launch; see docs/SIMULATION.md.

import { Engine } from './engine';
import { Life } from './life';
import type { Simulation } from './types';

const simulations: Record<string, () => Simulation> = {
  life: () => new Life(),
};

export function init(): void {
  const name = document.body.dataset.sim || 'life';
  if (name === 'none') return;
  const create = simulations[name] ?? simulations.life;

  const start = () => {
    const caption = document.querySelector<HTMLElement>('[data-sim-caption]');
    new Engine(create(), {
      caption,
      generation: caption?.querySelector<HTMLElement>('[data-sim-gen]'),
      toggle: caption?.querySelector<HTMLButtonElement>('[data-sim-toggle]'),
      action: caption?.querySelector<HTMLElement>('[data-sim-action]'),
    }).start();
  };

  // Start after the page has settled so the simulation never delays first paint.
  // (Safari has no requestIdleCallback.)
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start, { timeout: 2000 });
  else setTimeout(start, 300);
}
