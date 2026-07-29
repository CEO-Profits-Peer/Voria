'use client';

/**
 * Suche im eigenen Tagebuch.
 *
 * Sucht über Titel, Ort und Text — deutsche Wortstämme, also findet
 * „Regen" auch „regnete". Ergebnisse tragen das Theme ihrer Region,
 * damit man am Aussehen erkennt, aus welcher Reise sie stammen.
 */

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { suchen, type Treffer } from './actions';
import { useT } from '@/i18n/Sprachraum';

export function Suche() {
  const { t, locale } = useT();
  const [wort, setWort] = useState('');
  const [treffer, setTreffer] = useState<Treffer[]>([]);
  const [gesucht, setGesucht] = useState(false);
  const [laeuft, starten] = useTransition();

  useEffect(() => {
    if (wort.trim().length < 2) {
      setTreffer([]);
      setGesucht(false);
      return;
    }
    const uhr = setTimeout(() => {
      starten(async () => {
        setTreffer(await suchen(wort.trim()));
        setGesucht(true);
      });
    }, 320);
    return () => clearTimeout(uhr);
  }, [wort]);

  return (
    <div className="wrap">
      <div className="feld">
        <Search size={20} strokeWidth={1.5} aria-hidden />
        <input
          type="search"
          value={wort}
          onChange={(e) => setWort(e.target.value)}
          placeholder={t.suche.platzhalter}
          aria-label={t.suche.titel}
          autoFocus
        />
        {wort && (
          <button type="button" onClick={() => setWort('')} aria-label={t.suche.leeren}>
            <X size={18} strokeWidth={1.5} aria-hidden />
          </button>
        )}
      </div>

      {gesucht && treffer.length === 0 && !laeuft && (
        <p className="nichts">{t.suche.nichts}</p>
      )}

      <ul>
        {treffer.map((tr) => (
          <li key={tr.id} className="region-surface" data-region={tr.region}>
            <Link href={`/log/${tr.reiseId}/${tr.datum}`}>
              <span className="meta">
                {new Date(tr.datum).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {tr.ort && <> · {tr.ort}</>}
              </span>
              <span className="titel">{tr.titel ?? tr.reiseTitel}</span>
              {tr.auszug && <span className="auszug">{tr.auszug}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }
        .feld {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          height: 52px;
          padding: 0 var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-muted);
        }
        .feld:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: var(--font-ui);
          font-size: var(--size-18);
          color: var(--content-primary);
        }
        input::-webkit-search-cancel-button {
          display: none;
        }
        .feld button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--content-muted);
          cursor: pointer;
        }
        .nichts {
          margin: 0;
          font-size: var(--size-16);
          color: var(--content-muted);
        }
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        li {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          overflow: hidden;
        }
        li :global(a) {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-20);
          text-decoration: none;
        }
        .meta {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .titel {
          font-family: var(--font-display);
          font-size: var(--size-20);
          line-height: var(--leading-snug);
          color: var(--content-primary);
        }
        .auszug {
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
        }
      `}</style>
    </div>
  );
}
