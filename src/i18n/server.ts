import 'server-only';

import { cookies, headers } from 'next/headers';
import { COOKIE, STANDARD, istSprache, woerterbuch, gebietsschema, type Sprache } from './index';

/**
 * Sprache auf dem Server bestimmen.
 *
 * Reihenfolge: gesetztes Cookie, sonst der Accept-Language-Kopf des
 * Browsers, sonst Deutsch. Wer die Seite zum ersten Mal auf Englisch
 * öffnet, bekommt sie auch auf Englisch — ohne etwas einzustellen.
 */
export async function aktuelleSprache(): Promise<Sprache> {
  const gesetzt = (await cookies()).get(COOKIE)?.value;
  if (istSprache(gesetzt)) return gesetzt;

  const kopf = (await headers()).get('accept-language') ?? '';
  if (/^en\b/i.test(kopf.trim())) return 'en';

  return STANDARD;
}

/** Wörterbuch und Gebietsschema in einem Zug. */
export async function texte() {
  const sprache = await aktuelleSprache();
  return { sprache, t: woerterbuch(sprache), locale: gebietsschema(sprache) };
}
