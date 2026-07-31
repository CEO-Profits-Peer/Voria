'use client';

/**
 * Die Schalter für Hinweise, samt Stillem Modus.
 *
 * DER STILLE MODUS SCHREIBT DIE ANDEREN NICHT UM. Er steht als eigene
 * Spalte in der Datenbank und überschreibt sie, solange er an ist —
 * beim Ausschalten steht alles wieder so, wie es vorher war. Deshalb
 * werden die drei Einzelschalter hier nur ausgegraut, nicht auf `aus`
 * gesetzt: Man soll sehen, wohin man zurückkehrt.
 */

import { useOptimistic, useTransition } from 'react';
import { schalterSetzen, type HinweisSchalter as Welcher } from './actions';
import { Schalterzeile } from '@/ui/Schalterzeile';
import { useT } from '@/i18n/Sprachraum';

export interface SchalterStand {
  hinweis_kommentar: boolean;
  hinweis_folger: boolean;
  hinweis_upload: boolean;
  stiller_modus: boolean;
  /** Gehört nicht zu den Schaltern, kommt aber aus derselben Zeile. */
  startbereich: 'feed' | 'log';
}

export function HinweisSchalter({ stand }: { stand: SchalterStand }) {
  const { t } = useT();
  const [jetzt, setzeOptimistisch] = useOptimistic(
    stand,
    (alt, wechsel: { welcher: Welcher; an: boolean }) => ({ ...alt, [wechsel.welcher]: wechsel.an }),
  );
  const [, starten] = useTransition();

  const umlegen = (welcher: Welcher, an: boolean) =>
    starten(async () => {
      setzeOptimistisch({ welcher, an });
      await schalterSetzen(welcher, an);
    });

  const einzeln: { welcher: Welcher; wort: string }[] = [
    { welcher: 'hinweis_kommentar', wort: t.hinweise.schalterKommentar },
    { welcher: 'hinweis_folger', wort: t.hinweise.schalterFolger },
    { welcher: 'hinweis_upload', wort: t.hinweise.schalterUpload },
  ];

  return (
    <div className="schalter">
      <Schalterzeile
        wort={t.hinweise.stillerModus}
        zeile={t.hinweise.stillerModusZeile}
        an={jetzt.stiller_modus}
        beimUmlegen={(an) => umlegen('stiller_modus', an)}
      />

      <div className="trennung" role="separator" />

      {einzeln.map(({ welcher, wort }) => (
        <Schalterzeile
          key={welcher}
          wort={wort}
          an={jetzt[welcher]}
          /* Ausgegraut, aber der Stand bleibt sichtbar — man soll
             erkennen, wohin man zurückkehrt. */
          gesperrt={jetzt.stiller_modus}
          beimUmlegen={(an) => umlegen(welcher, an)}
        />
      ))}

      <style jsx>{`
        .schalter {
          display: flex;
          flex-direction: column;
        }
        .trennung {
          height: 1px;
          margin: var(--space-8) 0;
          background: var(--border-subtle);
        }
      `}</style>
    </div>
  );
}
