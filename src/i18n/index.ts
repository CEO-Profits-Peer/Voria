/**
 * Sprachwahl.
 *
 * Bewusst ohne `[locale]`-Routensegment: Das hätte jeden Pfad verdoppelt
 * und jede Verlinkung im Code angefasst. Stattdessen ein Cookie, das
 * Server und Browser gleichermaßen lesen.
 *
 * Der Preis: keine eigenen URLs je Sprache, also schwächere Auffindbarkeit
 * der Startseite. Sobald das zählt, bekommt nur `/` eine zweite Adresse —
 * die App dahinter bleibt, wie sie ist. Steht in ENTSCHEIDUNGEN.md.
 */

import { de } from './de';
import { en } from './en';
import type { Woerterbuch } from './de';

export type Sprache = 'de' | 'en';
export type { Woerterbuch };

export const SPRACHEN: { wert: Sprache; name: string }[] = [
  { wert: 'de', name: 'Deutsch' },
  { wert: 'en', name: 'English' },
];

export const COOKIE = 'voria-sprache';
export const STANDARD: Sprache = 'de';

const WOERTERBUECHER: Record<Sprache, Woerterbuch> = { de, en };

export function woerterbuch(sprache: Sprache): Woerterbuch {
  return WOERTERBUECHER[sprache] ?? WOERTERBUECHER[STANDARD];
}

export function istSprache(wert: string | undefined | null): wert is Sprache {
  return wert === 'de' || wert === 'en';
}

/** Für `toLocaleDateString` und Verwandte. */
export function gebietsschema(sprache: Sprache): string {
  return sprache === 'en' ? 'en-GB' : 'de-DE';
}
