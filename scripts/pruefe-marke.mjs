/**
 * Wächter für die Marke.
 *
 * Zwei Fehler sind in diesem Projekt schon passiert und beide waren
 * lautlos — kein Build-Fehler, keine Konsolenmeldung, nur ein Aussehen,
 * das niemand so beschlossen hatte:
 *
 *   1. Die Wortmarke las `--font-display`, einen Regionen-Slot. Mit
 *      einem aktiven PRO-Design wechselte „Voria" die Schrift.
 *   2. Das PRO-Design setzte seine Slots auf `:root` und färbte damit
 *      auch Navigation und Knöpfe um.
 *
 * Beides prüft dieses Skript. Es liest keine CSS-Semantik, sondern
 * sucht Muster — grob, aber es hätte beide Fälle gefunden.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = 'src';
const funde = [];

function dateien(ordner) {
  const raus = [];
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) raus.push(...dateien(pfad));
    else if (/\.(tsx|css)$/.test(pfad)) raus.push(pfad);
  }
  return raus;
}

for (const pfad of dateien(WURZEL)) {
  const inhalt = readFileSync(pfad, 'utf8');
  const zeilen = inhalt.split('\n');

  zeilen.forEach((zeile, i) => {
    const nr = i + 1;

    /*
     * 1. Wortmarke mit Regionen-Schrift.
     *
     * Gesucht wird eine Regel für `.marke` oder `.vo-wortmarke`, in
     * deren Nähe `--font-display` steht. Zeilenweise reicht nicht —
     * die Deklaration steht ein paar Zeilen unter dem Selektor.
     */
    if (/^\s*\.(vo-)?(wortmarke|marke)\s*\{/.test(zeile)) {
      const block = zeilen.slice(i, i + 10).join('\n');
      if (block.includes('--font-display')) {
        funde.push({
          pfad,
          nr,
          was: 'Wortmarke liest --font-display (Regionen-Slot) statt --marke-schrift',
        });
      }
    }

    /*
     * 2. Ein PRO-Design, das auf `:root` wirkt.
     *
     * Erlaubt ist `:root[data-pro-design=…] .region-surface` und
     * `… [data-region]`. Verboten ist der Selektor, der auf der Wurzel
     * selbst endet — dann trifft er die Bedienoberfläche mit.
     */
    if (zeile.includes('data-pro-design') && zeile.trimEnd().endsWith('{')) {
      const selektor = zeile.trim();
      const trifftFlaeche =
        selektor.includes('.region-surface') || selektor.includes('[data-region]');
      if (!trifftFlaeche) {
        funde.push({
          pfad,
          nr,
          was: 'PRO-Design wirkt auf die Wurzel — färbt Navigation und Knöpfe mit um',
        });
      }
    }
  });

  /*
   * 3. Ein Theme, das die Marke überschreibt.
   *
   * `--marke-*` darf ausschließlich in globals.css gesetzt werden.
   * Steht eine Zuweisung in regions.css oder pro-designs.css, ist die
   * Marke nicht mehr fest.
   */
  if (/regions\.css$|pro-designs\.css$/.test(pfad)) {
    zeilen.forEach((zeile, i) => {
      if (/^\s*--marke-[a-z-]+\s*:/.test(zeile)) {
        funde.push({
          pfad,
          nr: i + 1,
          was: 'Ein Theme überschreibt einen --marke-Wert. Die Marke steht fest.',
        });
      }
    });
  }
}

if (funde.length === 0) {
  console.log('✓ Die Marke steht fest: eigene Schrift, eigene Farbe, kein Theme darüber.');
  process.exit(0);
}

console.error('\n✗ Die Marke ist angreifbar:\n');
for (const f of funde) console.error(`  ${f.pfad}:${f.nr}\n      ${f.was}\n`);
console.error(`  Regel: Die Marke liest --marke-schrift, --marke-primaer,
  --marke-sichtbar und --marke-signal. Niemals --font-display oder
  --accent-*, denn die gehören den zwölf Regionen. Begründung steht
  im Kopfkommentar von src/styles/globals.css.
`);
process.exit(1);
