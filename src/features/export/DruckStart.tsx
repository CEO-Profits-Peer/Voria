'use client';

/**
 * Der Knopf, der den Druckdialog öffnet — und ein Satz dazu.
 *
 * Beides verschwindet beim Drucken selbst (`.druck-nur-schirm`),
 * sonst stünde „Als PDF speichern" mitten im fertigen Dokument.
 *
 * Kein automatisches `window.print()` beim Öffnen: Ein Dialog, der
 * ungefragt aufspringt, ist eine Zumutung — und wer erst nachsehen
 * will, wie es aussieht, kann das dann nicht.
 */

import { Printer } from 'lucide-react';

export function DruckStart({ hinweis, knopf }: { hinweis: string; knopf: string }) {
  return (
    <div className="druck-nur-schirm">
      <p>{hinweis}</p>
      <button type="button" onClick={() => window.print()}>
        <Printer size={17} strokeWidth={1.75} aria-hidden />
        {knopf}
      </button>

      <style jsx>{`
        div {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-12);
          max-width: 60ch;
          margin-bottom: var(--space-40);
          padding: var(--space-20);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
        }
        p {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
        }
        button {
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
      `}</style>
    </div>
  );
}
