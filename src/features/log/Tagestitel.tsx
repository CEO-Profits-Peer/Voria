'use client';

/**
 * Der Titel eines Tages.
 *
 * ZWEI FEHLER, DIE HIER ZUSAMMENKAMEN
 *
 * 1. Das Feld gab es nur im Modus „Seite". Auf der freien Fläche
 *    konnte man einem Tag keinen Titel geben — dieselbe Sorte Fehler
 *    wie damals bei Foto und Sichtbarkeit. Der Titel ist eine
 *    Eigenschaft des TAGES, nicht einer seiner Darstellungen.
 *
 * 2. Selbst im Modus „Seite" war es unsichtbar. Das Feld trug
 *    `placeholder=""` und dazu `::placeholder { color: transparent }`.
 *    Gemeint war Ruhe — „keine leere Zeile, wenn kein Titel da ist".
 *    Das Ergebnis war ein Eingabefeld, das niemand finden konnte.
 *
 * Deshalb steht der Titel jetzt einmal hier und wird von beiden Modi
 * benutzt. Der Platzhalter ist wieder sichtbar, aber leise: gedämpfte
 * Farbe, keine Aufforderung, kein Sternchen. Ein Tag ohne Titel bleibt
 * völlig in Ordnung.
 */

import { useEffect, useState } from 'react';
import { titelSpeichern } from './actions';
import { useT } from '@/i18n/Sprachraum';

export function Tagestitel({
  eintragId,
  titel: start,
  dicht = false,
}: {
  eintragId: string;
  titel: string | null;
  /** Kleinere Fassung für die freie Fläche, wo weniger Platz ist. */
  dicht?: boolean;
}) {
  const { t } = useT();
  const [titel, setTitel] = useState(start ?? '');

  /* Verzögertes Sichern wie überall im Log: 900 ms, kein Knopf. */
  useEffect(() => {
    if (titel === (start ?? '')) return;
    const uhr = setTimeout(() => titelSpeichern(eintragId, titel), 900);
    return () => clearTimeout(uhr);
  }, [titel, start, eintragId]);

  return (
    <>
      <input
        className="tagestitel"
        data-dicht={dicht}
        value={titel}
        onChange={(e) => setTitel(e.target.value)}
        placeholder={t.log.titelPlatzhalter}
        aria-label={t.log.titelDesTages}
        /* Ein Titel ist eine Zeile. Ohne das löst die Eingabetaste
           das umgebende Formular aus, wo es eines gibt. */
        enterKeyHint="done"
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />

      <style jsx>{`
        .tagestitel {
          width: 100%;
          border: none;
          background: transparent;
          padding: 0;
          font-family: var(--font-display);
          font-size: var(--size-30);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
          outline: none;
        }
        .tagestitel[data-dicht='true'] {
          font-size: var(--size-24);
        }
        /* Sichtbar, aber leise. Vorher stand hier eine durchsichtige
           Farbe, und damit war das Feld unauffindbar. */
        .tagestitel::placeholder {
          color: var(--content-muted);
          opacity: 0.65;
        }
        .tagestitel:focus::placeholder {
          opacity: 0.35;
        }
      `}</style>
    </>
  );
}
