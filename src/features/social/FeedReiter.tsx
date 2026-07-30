'use client';

/**
 * Die zwei Reiter über dem Feed.
 *
 * Verweise, keine Knöpfe. Der Reiter steht damit im Adressfeld, bleibt
 * beim Neuladen erhalten und lässt sich weitergeben — und der Wechsel
 * lädt die Beiträge serverseitig, statt sie im Browser nachzuholen.
 *
 * Dasselbe Muster wie die Reiter in `/suche`, absichtlich: wer eines
 * kennt, kennt beide. Die Gestaltung ist dort schon erprobt.
 */

import Link from 'next/link';
import type { Reiter } from './konstanten';

export function FeedReiter({
  aktiv,
  fuerDich,
  folgeIch,
}: {
  aktiv: Reiter;
  fuerDich: string;
  folgeIch: string;
}) {
  const reiter: { wert: Reiter; wort: string; ziel: string }[] = [
    { wert: 'fuerdich', wort: fuerDich, ziel: '/feed' },
    { wert: 'folgeich', wort: folgeIch, ziel: '/feed?reiter=folgeich' },
  ];

  return (
    <nav className="feed-reiter">
      {reiter.map((r) => (
        <Link
          key={r.wert}
          href={r.ziel}
          data-aktiv={aktiv === r.wert}
          aria-current={aktiv === r.wert ? 'page' : undefined}
          /* Der Reiter ist eine Ansicht derselben Seite, kein neues
             Ziel — der Bildlauf soll deshalb oben stehen bleiben. */
          scroll={false}
        >
          {r.wort}
        </Link>
      ))}

      <style jsx>{`
        .feed-reiter {
          display: flex;
          gap: 2px;
          padding: 3px;
          align-self: flex-start;
          width: fit-content;
          margin-bottom: var(--space-20);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
        }
        /* :global(), weil styled-jsx <Link> nicht scopet — gescopet
           über .feed-reiter davor. Siehe src/styles/huelle.css. */
        .feed-reiter :global(a) {
          display: inline-flex;
          align-items: center;
          /* 38 px sichtbar wie in der Suche, Trefferfläche über das
             Innenmaß auf 44 px gebracht. */
          height: 38px;
          padding: 0 var(--space-20);
          border-radius: 6px;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: 14px;
          font-weight: var(--weight-medium);
          text-decoration: none;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        .feed-reiter :global(a:hover) {
          color: var(--content-primary);
          text-decoration: none;
        }
        .feed-reiter :global(a[data-aktiv='true']) {
          background: var(--accent-soft);
          color: var(--content-accent);
          font-weight: var(--weight-semi);
        }
      `}</style>
    </nav>
  );
}
