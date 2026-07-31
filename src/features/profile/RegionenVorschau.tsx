'use client';

/**
 * Die zwölf Welten zum Ausprobieren, bevor man dort war.
 *
 * Bewusst ein Schaufenster und kein Formular. Für viele ist das das
 * Erste, was sie in Voria anschauen — es zeigt in einem Bild, was die
 * App von einem Notizbuch unterscheidet.
 *
 * Die Wahl hier ändert nichts an den eigenen Reisen. Die bekommen ihre
 * Region aus den Ländern, in denen man war.
 */

import { useState } from 'react';
import { REGIONS, type Region } from '@/themes/regions';
import { useT } from '@/i18n/Sprachraum';

export function RegionenVorschau() {
  const { t } = useT();
  const [vorschau, setVorschau] = useState<Region>('maghreb');

  return (
    <div className="vorschau">
      <p className="zeile">{t.einstellungen.weltenZeile}</p>

      <div className="regionen">
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            className="region-surface probe"
            data-region={r}
            data-aktiv={vorschau === r}
            onClick={() => setVorschau(r)}
          >
            <span className="punkt" />
            <span className="name">{t.regionen[r]}</span>
          </button>
        ))}
      </div>

      <div className="region-surface buehne" data-region={vorschau}>
        <span className="ornament-corner" aria-hidden />
        <div className="buehne-inhalt">
          <span className="buehne-meta">{t.start.beispielOrt2}</span>
          <h3>{t.regionen[vorschau]}</h3>
          <p>{t.start.beispielText2}</p>
          <div className="ornament-divider" />
        </div>
      </div>

      <style jsx>{`
        .zeile {
          margin: 0 0 var(--space-24);
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          max-width: 60ch;
          text-wrap: pretty;
        }
        .regionen {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-8);
          margin-bottom: var(--space-24);
        }
        .probe {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          min-height: 52px;
          padding: 0 var(--space-16);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          font-family: var(--font-ui);
          font-size: 12px;
          text-align: left;
          cursor: pointer;
          transition: border-color var(--motion-feed);
        }
        .probe[data-aktiv='true'] {
          border-color: var(--accent-primary);
        }
        .punkt {
          width: 14px;
          height: 14px;
          flex: none;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
        }
        .name {
          color: var(--content-primary);
        }
        .buehne {
          position: relative;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          overflow: hidden;
        }
        .buehne :global(.ornament-corner) {
          position: absolute;
          top: var(--space-12);
          right: var(--space-12);
        }
        .buehne-inhalt {
          padding: var(--space-32);
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .buehne-meta {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .buehne h3 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-30);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .buehne p {
          margin: 0;
          font-size: var(--size-18);
          line-height: var(--leading-relaxed);
          color: var(--content-primary);
          max-width: 52ch;
          text-wrap: pretty;
        }
      `}</style>
    </div>
  );
}
