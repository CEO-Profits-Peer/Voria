'use client';

/**
 * Suche — zwei Dinge unter einem Feld.
 *
 * TAGE: Volltext über Titel, Ort und Text mit deutschen Wortstämmen,
 * also findet „Regen" auch „regnete". Ergebnisse tragen das Theme ihrer
 * Region, damit man am Aussehen erkennt, aus welcher Reise sie stammen.
 *
 * LEUTE: Teilübereinstimmung auf Benutzername und Anzeigename. Namen
 * werden nicht gebeugt, deshalb kein Volltext — siehe Migration 0005.
 *
 * Bewusst ein Feld mit zwei Reitern statt zweier Suchseiten. Wer
 * jemanden sucht, tippt oft erst und merkt dann, dass er im falschen
 * Bereich ist; das Wort bleibt beim Umschalten deshalb stehen.
 */

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { suchen, leuteSuchen, type Treffer, type Person } from './actions';
import { FolgenKnopf } from '@/features/profile/FolgenKnopf';
import { Avatar } from '@/ui/Avatar';
import { useT } from '@/i18n/Sprachraum';

type Bereich = 'tage' | 'leute';

export function Suche() {
  const { t, locale } = useT();
  const [bereich, setBereich] = useState<Bereich>('tage');
  const [wort, setWort] = useState('');
  const [treffer, setTreffer] = useState<Treffer[]>([]);
  const [leute, setLeute] = useState<Person[]>([]);
  const [gesucht, setGesucht] = useState(false);
  const [laeuft, starten] = useTransition();

  useEffect(() => {
    if (wort.trim().length < 2) {
      setTreffer([]);
      setLeute([]);
      setGesucht(false);
      return;
    }
    /*
     * 320 ms Ruhe vor der Abfrage. Ohne das schickt jeder Anschlag
     * eine Suche los, und die Antworten kommen in beliebiger
     * Reihenfolge zurück — dann steht am Ende das Ergebnis zu einem
     * halb getippten Wort auf dem Schirm.
     */
    const uhr = setTimeout(() => {
      starten(async () => {
        if (bereich === 'tage') setTreffer(await suchen(wort.trim()));
        else setLeute(await leuteSuchen(wort.trim()));
        setGesucht(true);
      });
    }, 320);
    return () => clearTimeout(uhr);
  }, [wort, bereich]);

  const folgerZeile = (n: number) =>
    n === 0 ? t.suche.keinerFolgt : n === 1 ? t.suche.folgtEiner : `${n} ${t.suche.folgenMehrere}`;

  return (
    <div className="wrap">
      <div className="reiter" role="tablist" aria-label={t.suche.titel}>
        {(['tage', 'leute'] as Bereich[]).map((b) => (
          <button
            key={b}
            type="button"
            role="tab"
            aria-selected={bereich === b}
            data-aktiv={bereich === b}
            onClick={() => setBereich(b)}
          >
            {b === 'tage' ? t.suche.reiterTage : t.suche.reiterLeute}
          </button>
        ))}
      </div>

      <div className="feld">
        <Search size={20} strokeWidth={1.5} aria-hidden />
        <input
          type="search"
          value={wort}
          onChange={(e) => setWort(e.target.value)}
          placeholder={bereich === 'tage' ? t.suche.platzhalter : t.suche.platzhalterLeute}
          aria-label={t.suche.titel}
          autoFocus
        />
        {wort && (
          <button type="button" onClick={() => setWort('')} aria-label={t.suche.leeren}>
            <X size={18} strokeWidth={1.5} aria-hidden />
          </button>
        )}
      </div>

      {gesucht && !laeuft && (bereich === 'tage' ? treffer.length === 0 : leute.length === 0) && (
        <p className="nichts">{bereich === 'tage' ? t.suche.nichts : t.suche.nichtsLeute}</p>
      )}

      {bereich === 'leute' && leute.length > 0 && (
        <ul>
          {leute.map((p) => (
            <li key={p.id} className="person">
              <Link href={`/u/${p.benutzername}`} className="person-link">
                <Avatar bild={p.bild} name={p.name} groesse={44} />
                <span className="person-worte">
                  <span className="titel">{p.name}</span>
                  <span className="meta">
                    @{p.benutzername} · {folgerZeile(p.folgen)}
                  </span>
                  {p.bio && <span className="auszug">{p.bio}</span>}
                </span>
              </Link>
              <span className="person-tat">
                <FolgenKnopf profilId={p.id} folgtBereits={p.folgtBereits} />
              </span>
            </li>
          ))}
        </ul>
      )}

      <ul hidden={bereich !== 'tage'}>
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

        /* ---------- Reiter ---------- */
        .reiter {
          display: flex;
          gap: 2px;
          padding: 3px;
          align-self: flex-start;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
        }
        .reiter button {
          /* 38 px: kleiner als ein Hauptknopf, aber noch treffsicher. */
          height: 38px;
          padding: 0 var(--space-20);
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: 14px;
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        .reiter button:hover {
          color: var(--content-primary);
        }
        .reiter button[data-aktiv='true'] {
          background: var(--accent-soft);
          color: var(--content-accent);
          font-weight: var(--weight-semi);
        }

        /* ---------- Personentreffer ----------
           Der Verweis füllt die Zeile, der Folgen-Knopf sitzt daneben
           statt darin — ein Knopf innerhalb eines Verweises wäre für
           Tastatur und Screenreader unklar. */
        .person {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          padding-right: var(--space-16);
        }
        .person :global(a.person-link) {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: var(--space-16);
          padding: var(--space-16) var(--space-20);
          text-decoration: none;
        }
        .person-worte {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .person-worte .titel {
          font-size: var(--size-18);
        }
        .person-worte .meta {
          font-size: 12px;
          text-transform: none;
          letter-spacing: 0;
        }
        .person-worte .auszug {
          font-size: var(--size-14);
          /* Eine Bio kann lang sein — hier reicht eine Zeile. */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .person-tat {
          flex: none;
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
