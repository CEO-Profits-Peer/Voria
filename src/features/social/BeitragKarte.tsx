'use client';

/**
 * Ein Beitrag im Feed.
 *
 * Jeder Beitrag trägt das Theme seiner Region — deshalb sieht ein Feed
 * aus wie ein Stapel Postkarten aus verschiedenen Ländern und nicht wie
 * eine Tabelle. Das ist der sichtbarste Unterschied zu Instagram.
 *
 * Motion hier ist schneller als im Log: motion-feed, 200 ms.
 */

import { useOptimistic, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowBigUp, MessageCircle } from 'lucide-react';
import type { Beitrag } from './queries';
import { voten } from './actions';
import { FotoBild } from '@/features/log/FotoBild';
import { Avatar } from '@/ui/Avatar';
import { TeilenKnopf } from './TeilenKnopf';
import { Kommentare } from './Kommentare';
import { useT } from '@/i18n/Sprachraum';

export function BeitragKarte({ beitrag }: { beitrag: Beitrag }) {
  const { t, locale } = useT();
  const [kommentareOffen, setKommentareOffen] = useState(false);
  const [zustand, setzeOptimistisch] = useOptimistic(
    { votes: beitrag.votes, gesetzt: beitrag.selbstGevotet },
    (jetzt) => ({
      votes: jetzt.votes + (jetzt.gesetzt ? -1 : 1),
      gesetzt: !jetzt.gesetzt,
    }),
  );
  const [, starten] = useTransition();

  return (
    <article
      className="beitrag region-surface eintritt-feed"
      data-region={beitrag.region}
      /* Woran der Gelesen-Merker die Karte erkennt. Siehe FeedStrom. */
      data-beitrag={beitrag.id}
    >
      {/*
        Der Kopf führt zum Profil. Vorher stand der Name als reiner Text
        da — man sah, wer geschrieben hat, kam aber nicht hin.

        Der Verweis umfasst Bild und Name, nicht die Ortszeile: sonst
        würde ein Klick auf „Marrakesch · 3. Juli" zum Profil führen,
        was niemand erwartet.
      */}
      <header>
        <Link href={`/u/${beitrag.verfasser.benutzername}`} className="verfasser">
          <Avatar bild={beitrag.verfasser.bild} name={beitrag.verfasser.name} groesse={36} />
          <span className="wer">{beitrag.verfasser.name}</span>
        </Link>
        <span className="wo">
          {beitrag.tag.ort ?? t.feed.irgendwo} · {kurz(beitrag.tag.datum, locale)}
        </span>
      </header>

      {beitrag.foto && (
        <div className="bild">
          <FotoBild foto={beitrag.foto} />
        </div>
      )}

      {beitrag.tag.titel && <h2>{beitrag.tag.titel}</h2>}
      {beitrag.text && <p>{beitrag.text}</p>}

      <div className="ornament-divider" />

      <footer>
        <button
          type="button"
          data-gesetzt={zustand.gesetzt}
          onClick={() =>
            starten(() => {
              setzeOptimistisch(null);
              voten(beitrag.id, zustand.gesetzt);
            })
          }
          aria-pressed={zustand.gesetzt}
          aria-label={zustand.gesetzt ? t.feed.zustimmungZurueck : t.feed.zustimmen}
        >
          <ArrowBigUp size={20} strokeWidth={1.5} aria-hidden />
          <span>{zustand.votes}</span>
        </button>

        <TeilenKnopf
          beitragId={beitrag.id}
          titel={beitrag.tag.titel || beitrag.tag.ort || t.feed.einTag}
          verfasser={beitrag.verfasser.name}
        />

        {/*
          Drei Knöpfe, nicht vier. Repost ist entschieden noch nicht
          gebaut — ein toter Knopf in der Leiste wäre schlechter als
          keiner.
        */}
        <button
          type="button"
          onClick={() => setKommentareOffen((o) => !o)}
          aria-expanded={kommentareOffen}
        >
          <MessageCircle size={18} strokeWidth={1.5} aria-hidden />
          <span>{beitrag.kommentare > 0 ? beitrag.kommentare : t.kommentar.knopf}</span>
        </button>
      </footer>

      {kommentareOffen && (
        <Kommentare beitragId={beitrag.id} offen={beitrag.kommentareOffen} />
      )}

      <style jsx>{`
        .beitrag {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
          padding: var(--space-24);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          background: var(--raised-tint, var(--surface-raised));
        }
        header {
          display: flex;
          /* Nicht mehr baseline: mit dem Bild im Kopf muss die
             Ortszeile an der Mitte ausgerichtet sein, sonst klebt sie
             am oberen Rand des Kreises. */
          align-items: center;
          justify-content: space-between;
          gap: var(--space-12);
        }
        /* :global(), weil styled-jsx <Link> nicht scopet —
           siehe src/styles/huelle.css. Gescopet über header davor. */
        header :global(a.verfasser) {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          min-width: 0;
          text-decoration: none;
          color: inherit;
        }
        header :global(a.verfasser:hover) .wer {
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .wer {
          font-weight: var(--weight-medium);
          color: var(--content-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wo,
        footer span {
          font-size: var(--size-14);
          color: var(--content-muted);
        }
        .bild {
          border-radius: var(--radius-8);
          overflow: hidden;
        }
        h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-24);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        p {
          margin: 0;
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
        }
        /* Zwei Knöpfe im Fuß: Zustimmen links, Teilen rechts daneben.
           Ohne diese Regel wäre der Fuß ein Block und die Knöpfe
           würden nur zufällig nebeneinander liegen. */
        footer {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        footer button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          min-height: 44px;
          padding: 0 var(--space-12) 0 var(--space-8);
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        footer button:hover {
          background: var(--surface-sunken);
          color: var(--content-primary);
        }
        footer button[data-gesetzt='true'] {
          background: var(--accent-soft);
          color: var(--content-accent);
        }
      `}</style>
    </article>
  );
}

function kurz(iso: string, locale: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}
