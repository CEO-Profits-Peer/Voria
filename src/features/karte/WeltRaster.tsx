'use client';

/**
 * Die zwölf Regionen als begehbares Raster.
 *
 * Besuchte Regionen tragen ihr volles Theme — Textur, Akzent, Ornament.
 * Unbesuchte bleiben blass und ohne Material. Der Unterschied ist der
 * ganze Punkt: Man sieht auf einen Blick, wo die eigene Welt schon
 * Farbe hat und wo noch nicht.
 *
 * Kein Fortschrittsbalken, keine Prozentzahl, kein „12 von 195 Ländern
 * freigeschaltet". Das wäre Gamification, und die ist hier verboten.
 */

import { useState } from 'react';
import type { Region } from '@/themes/regions';
import { useT } from '@/i18n/Sprachraum';
import type { RegionStand } from './typen';
import { landName } from './typen';

export function WeltRaster({ regionen }: { regionen: RegionStand[] }) {
  const { t } = useT();
  const [offen, setOffen] = useState<Region | null>(
    regionen.find((r) => r.laender.length > 0)?.region ?? null,
  );

  const gewaehlt = regionen.find((r) => r.region === offen) ?? null;

  return (
    <div className="wrap">
      <div className="raster">
        {regionen.map((r, k) => {
          const besucht = r.laender.length > 0;
          return (
            <button
              key={r.region}
              type="button"
              className={besucht ? 'region-surface kachel eintritt' : 'kachel eintritt'}
              style={{ '--i': k } as React.CSSProperties}
              data-region={besucht ? r.region : undefined}
              data-besucht={besucht}
              data-offen={offen === r.region}
              onClick={() => setOffen(r.region)}
              aria-pressed={offen === r.region}
            >
              {besucht && <span className="ornament-corner" aria-hidden />}
              <span className="kachel-name">{t.regionen[r.region]}</span>
              <span className="kachel-zahl">
                {besucht
                  ? `${r.laender.length} ${r.laender.length === 1 ? t.log.land : t.log.laender} · ${r.tage} ${r.tage === 1 ? t.log.tag : t.log.tage}`
                  : t.karte.nochNicht}
              </span>
            </button>
          );
        })}
      </div>

      {gewaehlt && gewaehlt.laender.length > 0 && (
        <div className="region-surface tafel" data-region={gewaehlt.region}>
          <h2>{t.regionen[gewaehlt.region]}</h2>
          <div className="ornament-divider" />
          <ul>
            {gewaehlt.laender.map((code) => (
              <li key={code}>{landName(code)}</li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-32);
        }
        .raster {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-12);
        }
        .kachel {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          min-height: 104px;
          padding: var(--space-20);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          background: transparent;
          text-align: left;
          cursor: pointer;
          overflow: hidden;
          transition: border-color var(--motion-log), transform var(--motion-log);
        }
        .kachel[data-besucht='false'] {
          border-style: dashed;
          opacity: 0.55;
        }
        .kachel[data-offen='true'] {
          border-color: var(--accent-primary);
          border-style: solid;
        }
        .kachel :global(.ornament-corner) {
          position: absolute;
          top: var(--space-8);
          right: var(--space-8);
        }
        .kachel-name {
          font-family: var(--font-display);
          font-size: var(--size-18);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          color: var(--content-primary);
          padding-right: var(--space-32);
        }
        .kachel-zahl {
          font-size: var(--size-14);
          color: var(--content-muted);
        }
        .tafel {
          padding: var(--space-32);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .tafel h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-30);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .tafel ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-8) var(--space-16);
        }
        .tafel li {
          font-size: var(--size-18);
          color: var(--content-primary);
        }
      `}</style>
    </div>
  );
}
