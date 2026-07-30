'use client';

/**
 * Einstellungen: Erscheinungsbild und Regionen-Vorschau.
 *
 * Die Regionenwahl ist hier kein Pflichtfeld, sondern ein Schaufenster —
 * man kann jede der zwölf Welten ausprobieren, bevor man dort war.
 * Das ist das, was Voria als Erstes zeigen will.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Moon, Monitor } from 'lucide-react';
import { REGIONS, type Region } from '@/themes/regions';
import { useT } from '@/i18n/Sprachraum';
import { SprachWahl } from './SprachWahl';
import { HinweisSchalter, type SchalterStand } from '@/features/hinweise/HinweisSchalter';
import { StartWahl } from '@/features/hinweise/StartWahl';

type Modus = 'light' | 'dark' | 'system';

export function Einstellungen({ hinweise }: { hinweise: SchalterStand }) {
  const { t } = useT();
  const [modus, setModus] = useState<Modus>('system');
  const [vorschau, setVorschau] = useState<Region>('maghreb');

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
    <div className="wrap">
      <section>
        <h2>{t.einstellungen.erscheinungsbild}</h2>
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
        </div>
      </section>

      <SprachWahl />

      {/* Vor den zwölf Welten, weil die Welten das lange Schaufenster
          sind — was man einstellen WILL, soll nicht dahinter liegen. */}
      <section>
        <h2>{t.rueckmeldung.titel}</h2>
        <p className="zeile">{t.rueckmeldung.zeile}</p>
        <Link href="/rueckmeldung" className="wahl-verweis">
          {t.rueckmeldung.titel}
        </Link>
      </section>

      <section>
        <h2>{t.startbereich.titel}</h2>
        <StartWahl wert={hinweise.startbereich} still={hinweise.stiller_modus} />
      </section>

      <section>
        <h2>{t.hinweise.titel}</h2>
        <HinweisSchalter stand={hinweise} />
      </section>

      <section>
        <h2>{t.einstellungen.zwoelfWelten}</h2>
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
      </section>

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-48);
        }
        /* :global(), weil styled-jsx <Link> nicht scopet — gescopet
           über .wrap davor. Siehe src/styles/huelle.css. */
        .wrap :global(a.wahl-verweis) {
          display: inline-flex;
          align-items: center;
          height: 40px;
          padding: 0 var(--space-20);
          border: 1px solid var(--border-subtle);
          border-radius: 7px;
          background: var(--surface-raised);
          color: var(--content-secondary);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          text-decoration: none;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        .wrap :global(a.wahl-verweis:hover) {
          background: var(--surface-sunken);
          color: var(--content-primary);
          text-decoration: none;
        }
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
        .wahl button {
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
        .wahl button[data-aktiv='true'] {
          border-color: var(--accent-primary);
          background: var(--accent-soft);
          color: var(--content-accent);
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

