'use client';

/**
 * Konto löschen — der einzige Weg aus Voria heraus.
 *
 * Zwei Stufen: Erst ein unauffälliger Verweis, dann das Abtippen des
 * eigenen Benutzernamens. Kein „Wirklich?"-Dialog — den klickt man
 * weg, ohne ihn zu lesen. Einen Namen tippt man nicht versehentlich.
 *
 * Die Farbe bleibt zurückhaltend. Ein knallroter Bereich in den
 * Einstellungen macht Angst vor der App; das Löschen ist ein legitimer
 * Vorgang und kein Unfall, den es zu verhindern gilt.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { kontoLoeschen } from './kontoActions';
import { useT } from '@/i18n/Sprachraum';

export function KontoLoeschen({ benutzername }: { benutzername: string }) {
  const { t } = useT();
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [eingabe, setEingabe] = useState('');
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();

  const loeschen = () =>
    starten(async () => {
      setFehler(null);
      const ergebnis = await kontoLoeschen(eingabe);

      if (ergebnis.ok) {
        /* Harter Wechsel: nach dem Löschen darf nichts aus dem
           Zwischenspeicher der App mehr auftauchen. */
        window.location.href = '/';
        return;
      }

      setFehler(
        ergebnis.grund === 'nameFalsch'
          ? t.konto.nameFalsch
          : ergebnis.grund === 'dateien'
            ? t.konto.dateienFehler
            : t.konto.fehler,
      );
      router.refresh();
    });

  if (!offen) {
    return (
      <button type="button" className="oeffnen" onClick={() => setOffen(true)}>
        {t.konto.loeschen}
        <style jsx>{`
          .oeffnen {
            align-self: flex-start;
            padding: 0;
            border: none;
            background: none;
            color: var(--content-muted);
            font-family: var(--font-ui);
            font-size: var(--size-14);
            text-decoration: underline;
            text-underline-offset: 3px;
            cursor: pointer;
          }
          .oeffnen:hover {
            color: var(--content-primary);
          }
        `}</style>
      </button>
    );
  }

  return (
    <div className="kasten">
      <p className="was">{t.konto.wasPassiert}</p>

      <label className="feld">
        <span>{t.konto.tippeNamen.replace('{name}', benutzername)}</span>
        <input
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label={t.konto.tippeNamen.replace('{name}', benutzername)}
        />
      </label>

      {fehler && (
        <p className="fehler" role="alert">
          {fehler}
        </p>
      )}

      <div className="knoepfe">
        <button
          type="button"
          className="weg"
          disabled={laeuft || eingabe.trim() !== benutzername}
          onClick={loeschen}
        >
          {laeuft ? t.konto.laeuft : t.konto.endgueltig}
        </button>
        <button type="button" className="zurueck" onClick={() => setOffen(false)}>
          {t.konto.abbrechen}
        </button>
      </div>

      <style jsx>{`
        .kasten {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          padding: var(--space-20);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-sunken);
        }
        .was {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          max-width: 52ch;
          text-wrap: pretty;
        }
        .feld {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .feld span {
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--content-muted);
        }
        input {
          height: 40px;
          padding: 0 var(--space-12);
          border: 1px solid var(--border-default);
          border-radius: 7px;
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: var(--size-14);
        }
        input:focus {
          outline: none;
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .fehler {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--content-accent);
        }
        .knoepfe {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        button {
          height: 40px;
          padding: 0 var(--space-20);
          border-radius: 7px;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          cursor: pointer;
        }
        .weg {
          border: 1px solid var(--content-primary);
          background: var(--content-primary);
          color: var(--surface-canvas);
        }
        .weg:disabled {
          opacity: 0.4;
          cursor: default;
        }
        .zurueck {
          border: 1px solid var(--border-subtle);
          background: transparent;
          color: var(--content-secondary);
        }
      `}</style>
    </div>
  );
}
