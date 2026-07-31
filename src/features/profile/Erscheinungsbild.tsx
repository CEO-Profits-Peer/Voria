'use client';

/**
 * Hell, dunkel oder wie das Gerät.
 *
 * Steht in `localStorage`, nicht in der Datenbank: Das Theme muss vor
 * dem ersten Malen feststehen, sonst blitzt die helle Fassung auf.
 * Gesetzt wird es von dem kleinen Skript in `src/app/layout.tsx`,
 * hier wird es nur umgeschaltet.
 */

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useT } from '@/i18n/Sprachraum';

type Modus = 'light' | 'dark' | 'system';

export function Erscheinungsbild() {
  const { t } = useT();
  const [modus, setModus] = useState<Modus>('system');

  useEffect(() => {
    const gespeichert = localStorage.getItem('voria-theme') as Modus | null;
    setModus(gespeichert ?? 'system');
  }, []);

  const setzen = (m: Modus) => {
    setModus(m);
    if (m === 'system') {
      localStorage.removeItem('voria-theme');
      const dunkel = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = dunkel ? 'dark' : 'light';
    } else {
      localStorage.setItem('voria-theme', m);
      document.documentElement.dataset.theme = m;
    }
  };

  return (
    <div className="wahl" role="group" aria-label={t.einstellungen.erscheinungsbild}>
      {(
        [
          ['light', t.einstellungen.hell, Sun],
          ['dark', t.einstellungen.dunkel, Moon],
          ['system', t.einstellungen.wieGeraet, Monitor],
        ] as const
      ).map(([wert, text, Icon]) => (
        <button key={wert} type="button" data-aktiv={modus === wert} onClick={() => setzen(wert)}>
          <Icon size={18} strokeWidth={1.5} aria-hidden />
          {text}
        </button>
      ))}

      <style jsx>{`
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
      `}</style>
    </div>
  );
}
