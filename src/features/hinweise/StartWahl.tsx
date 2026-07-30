'use client';

/**
 * Womit Voria startet — Feed oder Log.
 *
 * Voreinstellung ist der Feed: Wer die App öffnet, soll etwas
 * vorfinden statt ein leeres Blatt. Wer das anders will, stellt es
 * hier um.
 *
 * Solange der Stille Modus an ist, startet Voria im Log. Die Wahl wird
 * dabei NICHT umgeschrieben — sie steht weiter da, nur ausgegraut,
 * damit man sieht, wohin man zurückkehrt. Dieselbe Regel wie bei den
 * Hinweisschaltern.
 */

import { useOptimistic, useTransition } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { startbereichSetzen } from './actions';
import { useT } from '@/i18n/Sprachraum';

export function StartWahl({ wert, still }: { wert: 'feed' | 'log'; still: boolean }) {
  const { t } = useT();
  const [jetzt, setzeOptimistisch] = useOptimistic(wert, (_, neu: 'feed' | 'log') => neu);
  const [, starten] = useTransition();

  const waehlen = (wohin: 'feed' | 'log') =>
    starten(async () => {
      setzeOptimistisch(wohin);
      await startbereichSetzen(wohin);
    });

  return (
    <div className="start">
      <p className="zeile">{t.startbereich.zeile}</p>

      <div className="wahl" role="group" aria-label={t.startbereich.titel}>
        {(
          [
            ['feed', t.startbereich.feed, Users],
            ['log', t.startbereich.log, BookOpen],
          ] as const
        ).map(([w, wort, Icon]) => (
          <button
            key={w}
            type="button"
            data-aktiv={jetzt === w}
            disabled={still}
            onClick={() => waehlen(w)}
          >
            <Icon size={18} strokeWidth={1.5} aria-hidden />
            {wort}
          </button>
        ))}
      </div>

      {still && <p className="still">{t.startbereich.stillHinweis}</p>}

      <style jsx>{`
        .start {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .zeile {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--content-muted);
        }
        .wahl {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          height: 40px;
          padding: 0 var(--space-20);
          border: 1px solid var(--border-subtle);
          border-radius: 7px;
          background: var(--surface-raised);
          color: var(--content-secondary);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        button[data-aktiv='true'] {
          background: var(--accent-soft);
          border-color: transparent;
          color: var(--content-accent);
          font-weight: var(--weight-semi);
        }
        button:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .still {
          margin: 0;
          font-family: var(--font-ui);
          font-size: 12px;
          line-height: var(--leading-normal);
          color: var(--content-muted);
          max-width: 46ch;
        }
      `}</style>
    </div>
  );
}
