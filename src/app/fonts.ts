/**
 * Schriften.
 *
 * `next/font/google` lädt die Dateien zur Bauzeit herunter und liefert sie
 * von der eigenen Domain — selbst gehostet, kein Abruf bei Google.
 *
 * DREI ROLLEN, streng getrennt:
 *
 *   font-ui       Inter      Bedienung: Navigation, Knöpfe, Felder,
 *                            Beschriftungen, Metazeilen. Nie im Inhalt.
 *   font-text     Literata   Tagebuchtext. In jeder Region dieselbe.
 *   font-display  wechselnd  Titel und Überschriften. Schicht-3-Slot.
 *
 * Warum drei: Serifen in der Navigation lesen sich altmodisch statt
 * ruhig. Alles, was man bedient, gehört in eine neutrale Sans —
 * so machen es Apple, Linear und Supabase. Die Wärme gehört dorthin,
 * wo gelesen wird, nicht dorthin, wo geklickt wird.
 *
 * Die alte Regel „höchstens zwei Familien" galt für den Inhalt und
 * bleibt dort gültig: eine Textschrift, eine Anzeigeschrift pro Region.
 */

import {
  Inter,
  Literata,
  Newsreader,
  Alegreya,
  Zen_Old_Mincho,
  Cormorant_Garamond,
} from 'next/font/google';

/** Bedienung. Überall gleich, nie regionsabhängig. */
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

/** Fließtext im Tagebuch. In jeder Region dieselbe. */
export const literata = Literata({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-literata',
});

/** Standard sowie Alpen, Nordeuropa, Nordamerika West. */
export const newsreader = Newsreader({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-newsreader',
});

/** Maghreb, Ostafrika, Anden, Südasien, Südostasien — warm, handwerklich. */
export const alegreya = Alegreya({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-alegreya',
});

/** Mittelmeer, Naher Osten, Ozeanien — hell, hoch, mediterran. */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-cormorant',
});

/** Ostasien. */
export const zenOldMincho = Zen_Old_Mincho({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mincho',
});

export const fontVariables = [
  inter.variable,
  literata.variable,
  newsreader.variable,
  alegreya.variable,
  cormorant.variable,
  zenOldMincho.variable,
].join(' ');
