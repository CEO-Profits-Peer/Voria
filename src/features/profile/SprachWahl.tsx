'use client';

import { useTransition } from 'react';
import { Languages } from 'lucide-react';
import { SPRACHEN, type Sprache } from '@/i18n';
import { useT } from '@/i18n/Sprachraum';
import { spracheSetzen } from '@/i18n/actions';

export function SprachWahl() {
  const { t, sprache } = useT();
  const [laeuft, starten] = useTransition();

  return (
    <section>
      <h2>{t.einstellungen.sprache}</h2>
      <p className="zeile">{t.einstellungen.spracheZeile}</p>

      <div className="wahl" role="group" aria-label={t.einstellungen.sprache}>
        {SPRACHEN.map(({ wert, name }) => (
          <button
            key={wert}
            type="button"
            data-aktiv={sprache === wert}
            disabled={laeuft}
            onClick={() => starten(() => void spracheSetzen(wert as Sprache))}
          >
            <Languages size={18} strokeWidth={1.5} aria-hidden />
            {name}
          </button>
        ))}
      </div>

      <style jsx>{`
        h2 {
          margin: 0 0 var(--space-16);
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        .zeile {
          margin: calc(var(--space-8) * -1) 0 var(--space-24);
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          max-width: 60ch;
          text-wrap: pretty;
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
          height: 44px;
          padding: 0 var(--space-20);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-secondary);
          font-family: var(--font-ui);
          font-size: 13px;
          cursor: pointer;
          transition: border-color var(--motion-feed), background var(--motion-feed);
        }
        button[data-aktiv='true'] {
          border-color: var(--accent-primary);
          background: var(--accent-soft);
          color: var(--content-accent);
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>
    </section>
  );
}
