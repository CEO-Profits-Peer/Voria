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
      <Zeile
        wort={t.hinweise.stillerModus}
        zeile={t.hinweise.stillerModusZeile}
        an={jetzt.stiller_modus}
        beimUmlegen={(an) => umlegen('stiller_modus', an)}
      />

      <div className="trennung" role="separator" />

      {einzeln.map(({ welcher, wort }) => (
        <Zeile
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

function Zeile({
  wort,
  zeile,
  an,
  gesperrt = false,
  beimUmlegen,
}: {
  wort: string;
  zeile?: string;
  an: boolean;
  gesperrt?: boolean;
  beimUmlegen: (an: boolean) => void;
}) {
  return (
    <label className="zeile" data-gesperrt={gesperrt}>
      <span className="worte">
        <span className="wort">{wort}</span>
        {zeile && <span className="zusatz">{zeile}</span>}
      </span>
      <input
        type="checkbox"
        checked={an}
        disabled={gesperrt}
        onChange={(e) => beimUmlegen(e.target.checked)}
      />

      <style jsx>{`
        .zeile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-16);
          /* 52 px: bequem zu treffen, ohne dass die Liste auseinanderfällt. */
          min-height: 52px;
          cursor: pointer;
        }
        .zeile[data-gesperrt='true'] {
          opacity: 0.45;
          cursor: default;
        }
        .worte {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .wort {
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--content-primary);
        }
        .zusatz {
          font-family: var(--font-ui);
          font-size: 12px;
          line-height: var(--leading-normal);
          color: var(--content-muted);
          max-width: 46ch;
          text-wrap: pretty;
        }
        input {
          flex: none;
          width: 20px;
          height: 20px;
          accent-color: var(--accent-primary);
          cursor: inherit;
        }
      `}</style>
    </label>
  );
}
