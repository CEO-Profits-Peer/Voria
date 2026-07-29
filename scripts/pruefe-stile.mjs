/**
 * Wächter gegen einen Fehler, der sonst lautlos durchgeht.
 *
 * styned-jsx hängt seine Scope-Klasse `jsx-<hash>` nur an JSX-Elemente
 * mit kleinem Anfangsbuchstaben, also an echte DOM-Elemente. Importierte
 * Komponenten — <Link> aus next/link, Icons aus lucide-react, eigene
 * Bausteine — bekommen sie NICHT.
 *
 * Steht dann im <style jsx>-Block eine Regel `.ziel { … }`, landet im
 * Bundle `.ziel.jsx-abc123`. Am Element steht aber nur `class="ziel"`.
 * Der Selektor passt nie. Kein Build-Fehler, keine Warnung, keine
 * Konsolenmeldung — die Oberfläche sieht einfach ungestaltet aus.
 *
 * Genau das hat die Navigation lahmgelegt. Dieses Skript findet es.
 *
 * Zwei erlaubte Auswege, die das Skript akzeptiert:
 *   1. `:global(a.ziel)` mit einem nativen Elternelement davor
 *   2. Stile in einer echten CSS-Datei unter src/styles/
 *
 * Aufruf:  npm run pruefe:stile
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = 'src';

function dateien(pfad) {
  const raus = [];
  for (const name of readdirSync(pfad)) {
    const p = join(pfad, name);
    if (statSync(p).isDirectory()) raus.push(...dateien(p));
    else if (name.endsWith('.tsx')) raus.push(p);
  }
  return raus;
}

const funde = [];

for (const pfad of dateien(WURZEL)) {
  const quelle = readFileSync(pfad, 'utf8');
  if (!quelle.includes('<style jsx')) continue;

  // Inhalt aller <style jsx>-Blöcke.
  const bloecke = [...quelle.matchAll(/<style jsx[^>]*>\{`([\s\S]*?)`\}<\/style>/g)]
    .map((m) => m[1])
    .join('\n')
    // CSS-Kommentare weg — ein erklärender Hinweis auf einen
    // Klassennamen ist keine Regel und darf keinen Alarm auslösen.
    .replace(/\/\*[\s\S]*?\*\//g, '');
  if (!bloecke) continue;

  // Was steht in :global(...)? Das ist bewusst ausgenommen.
  const global = [...bloecke.matchAll(/:global\(([^)]*)\)/g)].map((m) => m[1]).join(' ');

  // className="…" an Elementen mit GROSSEM Anfangsbuchstaben.
  const treffer = new Set();
  for (const m of quelle.matchAll(/<([A-Z][A-Za-z0-9_]*)\b((?:[^<>]|\{[^{}]*\})*?)\/?>/g)) {
    const [, tag, attribute] = m;
    for (const c of attribute.matchAll(/className="([^"]*)"/g)) {
      for (const klasse of c[1].split(/\s+/).filter(Boolean)) {
        // Wird die Klasse im Block gestylt — und zwar NICHT in :global()?
        const gestylt = new RegExp(`\\.${klasse}(?![\\w-])`).test(bloecke);
        const freigestellt = new RegExp(`\\.${klasse}(?![\\w-])`).test(global);
        if (gestylt && !freigestellt) treffer.add(`<${tag} className="${klasse}">`);
      }
    }
  }

  if (treffer.size) funde.push({ pfad, treffer: [...treffer] });
}

if (funde.length === 0) {
  console.log('✓ Keine ungescopeten styled-jsx-Regeln auf Komponenten.');
  process.exit(0);
}

console.error('\n✗ styled-jsx greift hier NICHT (Scope-Klasse fehlt am Element):\n');
for (const { pfad, treffer } of funde) {
  console.error(`  ${pfad}`);
  for (const t of treffer) console.error(`      ${t}`);
}
console.error(`
  Behebung — eines von beidem:

    a) :global() benutzen UND über ein natives Elternelement scopen:
           .kopf :global(a.zurueck) { … }

    b) Die Stile in eine echte CSS-Datei unter src/styles/ ziehen
       und dort einen eindeutigen Namen mit Präfix vo- verwenden.
       Nötig, wenn die Komponente selbst das Wurzelelement ist.
`);
process.exit(1);
