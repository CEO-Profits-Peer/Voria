/**
 * Schaltfläche.
 *
 * Bedienung, also Sans-Serif. Enger und ruhiger als vorher —
 * 34/38/44 statt 36/44/52, kleinere Schrift, weichere Ränder.
 * Vorbild sind die Knöpfe von Linear und Supabase: klein, präzise,
 * ohne Aufsehen.
 */

'use client';

import type { ButtonHTMLAttributes } from 'react';

type Art = 'primaer' | 'sekundaer' | 'geist' | 'gefahr';
type Groesse = 'klein' | 'mittel' | 'gross';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  art?: Art;
  groesse?: Groesse;
  breit?: boolean;
}

export function Knopf({
  art = 'sekundaer',
  groesse = 'mittel',
  breit = false,
  children,
  ...rest
}: Props) {
  return (
    <button data-art={art} data-groesse={groesse} data-breit={breit} {...rest}>
      {children}

      <style jsx>{`
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 7px;
          border: 1px solid transparent;
          font-family: var(--font-ui);
          font-weight: var(--weight-medium);
          letter-spacing: -0.005em;
          white-space: nowrap;
          cursor: pointer;
          transition: background var(--motion-feed), border-color var(--motion-feed),
            color var(--motion-feed);
        }
        button[data-breit='true'] {
          width: 100%;
        }

        button[data-groesse='klein'] {
          height: 30px;
          padding: 0 12px;
          font-size: 12px;
        }
        button[data-groesse='mittel'] {
          height: 34px;
          padding: 0 14px;
          font-size: 13px;
        }
        button[data-groesse='gross'] {
          height: 40px;
          padding: 0 18px;
          font-size: 14px;
        }

        button[data-art='primaer'] {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: var(--accent-contrast);
        }
        button[data-art='primaer']:hover:not(:disabled) {
          background: var(--accent-hover);
          border-color: var(--accent-hover);
        }
        button[data-art='primaer']:active:not(:disabled) {
          background: var(--accent-active);
          border-color: var(--accent-active);
        }

        button[data-art='sekundaer'] {
          background: var(--surface-raised);
          border-color: var(--border-default);
          color: var(--content-primary);
        }
        button[data-art='sekundaer']:hover:not(:disabled) {
          border-color: var(--border-strong);
          background: var(--surface-sunken);
        }

        button[data-art='geist'] {
          background: transparent;
          color: var(--content-secondary);
        }
        button[data-art='geist']:hover:not(:disabled) {
          background: var(--surface-sunken);
          color: var(--content-primary);
        }

        button[data-art='gefahr'] {
          background: transparent;
          border-color: var(--border-default);
          color: var(--state-danger);
        }
        button[data-art='gefahr']:hover:not(:disabled) {
          background: var(--state-danger);
          border-color: var(--state-danger);
          color: var(--accent-contrast);
        }

        button:disabled {
          background: var(--surface-sunken);
          border-color: var(--border-subtle);
          color: var(--border-strong);
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}
