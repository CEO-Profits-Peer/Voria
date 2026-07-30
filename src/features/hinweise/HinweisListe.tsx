'use client';

/**
 * Die Liste der Hinweise.
 *
 * Ungelesene stehen nicht oben, sondern werden nur leicht abgesetzt.
 * Sortiert wird nach Zeit, weil das die Reihenfolge ist, in der die
 * Dinge passiert sind — und weil Ungelesenes nach oben zu ziehen den
 * Punkt zu einer Aufgabe macht, die man abarbeiten muss.
 */

import Link from 'next/link';
import type { Hinweis } from './queries';
import { Avatar } from '@/ui/Avatar';
import { useT } from '@/i18n/Sprachraum';

export function HinweisListe({ hinweise }: { hinweise: Hinweis[] }) {
  const { t, locale } = useT();

  const satz = (h: Hinweis) =>
    h.art === 'folger'
      ? t.hinweise.folgtDir
      : h.art === 'antwort'
        ? t.hinweise.hatGeantwortet
        : h.art === 'kommentar'
          ? t.hinweise.hatKommentiert
          : t.hinweise.hatGeteilt;

  return (
    <ul className="liste">
      {hinweise.map((h) => {
        const inhalt = (
          <>
            <Avatar bild={h.wer.bild} name={h.wer.name} groesse={36} />
            <span className="worte">
              <span className="satz">
                <strong>{h.wer.name}</strong> {satz(h)}
              </span>
              <span className="wann">
                {new Date(h.wann).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </span>
            {!h.gelesen && <span className="frisch" aria-label={t.hinweise.ungelesen} />}
          </>
        );

        return (
          <li key={h.id} data-frisch={!h.gelesen}>
            {/* Fehlt das Ziel — der Beitrag wurde gelöscht, während der
                Hinweis noch stand —, bleibt die Zeile stehen, aber als
                Text. Ein Verweis ins Nichts ist schlimmer als keiner. */}
            {h.ziel ? (
              <Link href={h.ziel} className="hinweis-zeile">
                {inhalt}
              </Link>
            ) : (
              <span className="hinweis-zeile">{inhalt}</span>
            )}
          </li>
        );
      })}

      <style jsx>{`
        .liste {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        li {
          border-bottom: 1px solid var(--border-subtle);
        }
        li:last-child {
          border-bottom: none;
        }
        /* :global(), weil styled-jsx <Link> nicht scopet. Gescopet über
           li davor — siehe src/styles/huelle.css. */
        li :global(.hinweis-zeile) {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          min-height: 64px;
          padding: var(--space-12) var(--space-4);
          text-decoration: none;
          color: inherit;
        }
        li :global(a.hinweis-zeile:hover) {
          text-decoration: none;
        }
        li[data-frisch='true'] :global(.hinweis-zeile) {
          /* Kein Farbblock, nur etwas mehr Gewicht. Ungelesen ist eine
             Information, kein Alarm. */
          background: var(--surface-raised);
        }
        .worte {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .satz {
          font-size: var(--size-14);
          line-height: var(--leading-snug);
          color: var(--content-secondary);
        }
        .satz strong {
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .wann {
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--content-muted);
        }
        .frisch {
          flex: none;
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
        }
      `}</style>
    </ul>
  );
}
