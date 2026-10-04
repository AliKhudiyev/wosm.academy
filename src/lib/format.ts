import { site } from '../config/site';

const dateFormat = new Intl.DateTimeFormat(site.locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** 2026-10-05 → "5 October 2026" */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** 2026-10-05 → "2026-10-05" (for <time datetime>) */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Rough reading time in minutes for a Markdown body. */
export function readingTime(markdown: string | undefined): number {
  const words = (markdown ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`|[\]()-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Page <title>: "Page — WoSM Academy". */
export function pageTitle(title?: string): string {
  return title ? `${title} — ${site.name}` : `${site.name} — ${site.longName}`;
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
