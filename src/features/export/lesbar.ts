/**
 * Der Export für Menschen, nicht für Maschinen.
 *
 * `voria.json` enthält alles vollständig und ist der Teil, aus dem
 * sich später wieder etwas einlesen lässt. Aber niemand liest in zehn
 * Jahren eine JSON-Datei, um nachzulesen, wie sich sein Leben
 * angefühlt hat.
 *
 * Deshalb liegt neben den Daten je Reise eine Textdatei, die man
 * einfach aufschlagen kann — in jedem Editor, auf jedem Gerät, ohne
 * Voria, ohne Netz, ohne Programm. Markdown, weil es sich auch dann
 * noch angenehm liest, wenn es niemand darstellt.
 *
 * Das ist zugleich die Vorstufe zum gesetzten PDF: Dieselbe Struktur,
 * nur später mit Papier und Ornament.
 */

import type { ExportDaten } from './queries';

/** Aus einem Titel einen Dateinamen machen, der überall funktioniert. */
export function dateiName(text: string, ersatz = 'ohne-titel'): string {
  const sauber = text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    /* Alles, was Windows, macOS oder Linux stört, fällt weg. */
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return sauber || ersatz;
}

function datumLang(iso: string, locale: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Eine Reise als lesbare Datei. */
export function reiseAlsText(
  reise: ExportDaten['reisen'][number],
  locale: string,
): string {
  const zeilen: string[] = [];

  zeilen.push(`# ${reise.titel}`, '');

  const spanne = reise.von
    ? reise.bis && reise.bis !== reise.von
      ? `${datumLang(reise.von, locale)} bis ${datumLang(reise.bis, locale)}`
      : datumLang(reise.von, locale)
    : '';

  if (spanne) zeilen.push(spanne, '');
  if (reise.laender.length > 0) zeilen.push(reise.laender.join(' · '), '');

  zeilen.push(
    `${reise.tage.length} ${reise.tage.length === 1 ? 'Tag' : 'Tage'}`,
    '',
    '---',
    '',
  );

  for (const tag of reise.tage) {
    zeilen.push(`## ${datumLang(tag.datum, locale)}`, '');

    if (tag.titel) zeilen.push(`**${tag.titel}**`, '');
    if (tag.ort) zeilen.push(`*${tag.ort}*`, '');

    for (const block of tag.bloecke) {
      if (block.art === 'text' && block.text?.trim()) {
        zeilen.push(block.text.trim(), '');
      }
      if (block.foto) {
        /*
         * Ein Markdown-Bild mit relativem Pfad. Wer den Ordner
         * entpackt und die Datei in einem Betrachter öffnet, sieht
         * das Foto an der richtigen Stelle im Text stehen.
         */
        zeilen.push(`![](../fotos/${block.foto})`, '');
      }
    }

    zeilen.push('---', '');
  }

  return zeilen.join('\n');
}

/** Die Datei, die erklärt, was hier drin liegt. */
export function liesMich(daten: ExportDaten, locale: string): string {
  const anzahlTage = daten.reisen.reduce((n, r) => n + r.tage.length, 0);

  return `Dein Voria-Tagebuch
===================

Erstellt am ${datumLang(daten.erstellt.slice(0, 10), locale)}
für @${daten.profil.benutzername}

${daten.reisen.length} ${daten.reisen.length === 1 ? 'Reise' : 'Reisen'} · ${anzahlTage} ${
    anzahlTage === 1 ? 'Tag' : 'Tage'
  } · ${daten.fotos.length} ${daten.fotos.length === 1 ? 'Foto' : 'Fotos'}


WAS HIER DRIN LIEGT
-------------------

reisen/     Je eine Datei pro Reise, zum Lesen. Einfacher Text mit
            Markdown — jeder Editor kann das öffnen, heute und in
            zwanzig Jahren. Die Fotos stehen an der Stelle im Text,
            an der sie im Tagebuch standen.

fotos/      Alle deine Bilder, wie sie in Voria lagen.

voria.json  Alles noch einmal, vollständig und maschinenlesbar.
            Diese Datei ist dafür da, dein Tagebuch irgendwann
            woanders wieder einzulesen. Format-Fassung ${daten.fassung}.


WICHTIG ZU DEN FOTOS
--------------------

Das sind die Anzeigefassungen, wie Voria sie gespeichert hat — nicht
die Originale von deiner Kamera. Voria legt bewusst nur die
verkleinerte Fassung ab; das Original blieb auf deinem Gerät.


DIESE DATEIEN GEHÖREN DIR
-------------------------

Es steckt keine Sperre darin, kein Passwort, kein Format, das nur
Voria lesen kann. Du brauchst weder ein Konto noch eine Verbindung,
um sie zu öffnen. Genau darum gibt es diesen Export.
`;
}
