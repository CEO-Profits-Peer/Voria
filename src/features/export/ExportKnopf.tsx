'use client';

/**
 * Den Export anstoßen und im Browser zusammenbauen.
 *
 * Ablauf: Daten vom Server holen, danach jedes Foto einzeln laden und
 * ins Archiv legen, am Ende speichern.
 *
 * DREI ENTSCHEIDUNGEN, DIE HIER STECKEN
 *
 * 1. FORTSCHRITT WIRD GEZEIGT, WEIL ES DAUERT. Bei zweihundert Fotos
 *    vergehen Minuten. Ein Knopf, der einfach nichts tut, sieht dabei
 *    kaputt aus — und man drückt ihn wieder.
 *
 * 2. EIN FEHLENDES FOTO BRICHT NICHTS AB. Wenn eine Datei nicht mehr
 *    im Speicher liegt, wird das vermerkt und weitergemacht. Ein
 *    Export, der an einem einzelnen Bild scheitert, hilft niemandem —
 *    schon gar nicht dem, der ihn gerade braucht.
 *
 * 3. VIER GLEICHZEITIG, NICHT ALLE. Alle Fotos auf einmal anzufordern
 *    lässt den Browser die Verbindungen in eine Warteschlange stellen
 *    und macht den Fortschritt zu einem Sprung von 0 auf 100. Vier
 *    parallel ist schnell und bleibt ehrlich.
 */

import { useState } from 'react';
import { Download } from 'lucide-react';
import type { ExportDaten } from './queries';
import { holeExportDaten } from './actions';
import { zipBauen, type ZipEintrag } from './zip';
import { reiseAlsText, liesMich, dateiName } from './lesbar';
import { bildUrl } from '@/lib/bild-url';
import { useT } from '@/i18n/Sprachraum';

/** Wie viele Fotos gleichzeitig geladen werden. */
const GLEICHZEITIG = 4;

type Stand =
  | { art: 'bereit' }
  | { art: 'laeuft'; fertig: number; gesamt: number }
  | { art: 'fertig'; fehlend: number }
  | { art: 'fehler' };

export function ExportKnopf() {
  const { t, locale } = useT();
  const [stand, setStand] = useState<Stand>({ art: 'bereit' });

  const starten = async () => {
    setStand({ art: 'laeuft', fertig: 0, gesamt: 0 });

    let daten: ExportDaten | null;
    try {
      daten = await holeExportDaten();
    } catch (fehler) {
      console.error('[Export] Daten nicht ladbar:', fehler);
      setStand({ art: 'fehler' });
      return;
    }

    if (!daten) {
      setStand({ art: 'fehler' });
      return;
    }

    const kodierer = new TextEncoder();
    const eintraege: ZipEintrag[] = [
      { name: 'LIES-MICH.txt', daten: kodierer.encode(liesMich(daten, locale)) },
      {
        name: 'voria.json',
        daten: kodierer.encode(JSON.stringify(daten, null, 2)),
      },
    ];

    /* Eine Textdatei je Reise, benannt nach Datum und Titel. */
    const vergeben = new Set<string>();
    for (const reise of daten.reisen) {
      const beginn = reise.von ? `${reise.von}-` : '';
      let name = `reisen/${beginn}${dateiName(reise.titel)}.md`;

      /* Zwei Reisen dürfen gleich heißen — Dateien nicht. */
      let n = 2;
      while (vergeben.has(name)) {
        name = `reisen/${beginn}${dateiName(reise.titel)}-${n++}.md`;
      }
      vergeben.add(name);

      eintraege.push({ name, daten: kodierer.encode(reiseAlsText(reise, locale)) });
    }

    /* ---- Die Fotos ---- */
    const gesamt = daten.fotos.length;
    setStand({ art: 'laeuft', fertig: 0, gesamt });

    let fertig = 0;
    let fehlend = 0;
    const warteschlange = [...daten.fotos];

    const arbeiter = async () => {
      for (;;) {
        const foto = warteschlange.shift();
        if (!foto) return;

        try {
          const antwort = await fetch(bildUrl(foto.schluessel));
          if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
          const inhalt = new Uint8Array(await antwort.arrayBuffer());
          eintraege.push({ name: `fotos/${foto.datei}`, daten: inhalt });
        } catch (fehler) {
          /*
           * Nur vermerken, nicht abbrechen. Die fehlende Datei steht
           * danach in LIES-MICH nicht — aber der Rest ist gerettet.
           */
          console.error('[Export] Foto fehlt:', foto.schluessel, fehler);
          fehlend++;
        }

        fertig++;
        setStand({ art: 'laeuft', fertig, gesamt });
      }
    };

    await Promise.all(Array.from({ length: GLEICHZEITIG }, arbeiter));

    /* ---- Speichern ---- */
    try {
      const blob = zipBauen(eintraege);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voria-${daten.profil.benutzername || 'tagebuch'}-${
        daten.erstellt.slice(0, 10)
      }.zip`;
      a.click();
      /* Der Browser braucht die Adresse noch einen Moment. */
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      setStand({ art: 'fertig', fehlend });
    } catch (fehler) {
      console.error('[Export] Archiv nicht baubar:', fehler);
      setStand({ art: 'fehler' });
    }
  };

  return (
    <div className="ex">
      <button
        type="button"
        onClick={starten}
        disabled={stand.art === 'laeuft'}
        className="ex-knopf"
      >
        <Download size={17} strokeWidth={1.75} aria-hidden />
        {stand.art === 'laeuft' ? t.export.laeuft : t.export.knopf}
      </button>

      {stand.art === 'laeuft' && (
        <p className="ex-zeile" role="status">
          {stand.gesamt > 0
            ? t.export.fortschritt
                .replace('{fertig}', String(stand.fertig))
                .replace('{gesamt}', String(stand.gesamt))
            : t.export.sammelt}
        </p>
      )}

      {stand.art === 'fertig' && (
        <p className="ex-zeile" role="status">
          {stand.fehlend === 0
            ? t.export.fertig
            : t.export.fertigMitLuecken.replace('{anzahl}', String(stand.fehlend))}
        </p>
      )}

      {stand.art === 'fehler' && (
        <p className="ex-zeile" role="alert">
          {t.export.fehler}
        </p>
      )}

      <style jsx>{`
        .ex {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
          align-items: flex-start;
        }
        .ex-knopf {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 44px;
          padding: 0 var(--space-20);
          border: 1px solid var(--accent-primary);
          border-radius: 7px;
          background: var(--accent-primary);
          color: var(--accent-contrast);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          cursor: pointer;
        }
        .ex-knopf:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .ex-zeile {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-muted);
          /* Tabellenziffern: sonst zappelt die Zahl beim Hochzählen. */
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
