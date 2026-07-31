'use client';

/**
 * Die zwei Reiter über dem Feed.
 *
 * Verweise, keine Knöpfe. Der Reiter steht damit im Adressfeld, bleibt
 * beim Neuladen erhalten und lässt sich weitergeben — und der Wechsel
 * lädt die Beiträge serverseitig, statt sie im Browser nachzuholen.
 *
 * SICHTBAR BEIM HOCHSCROLLEN, WEG BEIM WEITERLESEN
 *
 * Die Leiste klebt oben, versteckt sich aber, sobald man nach unten
 * liest — beim Lesen braucht niemand einen Reiter. Ein Stück
 * Hochscrollen holt sie zurück. Das ist die Geste, die ohnehin
 * bedeutet „ich will hier weg", und sie kommt ohne festen Balken aus,
 * der dauerhaft Platz kostet.
 *
 * Zwei Feinheiten, die den Unterschied machen:
 *
 * 1. SCHWELLE statt jedem Pixel. Ohne sie flackert die Leiste beim
 *    kleinsten Ruckeln des Zeigefingers auf und ab.
 * 2. Ganz oben ist sie immer da. Sonst bliebe sie beim Seitenanfang
 *    versteckt, obwohl dort gar nichts zu verstecken ist.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Reiter } from './konstanten';

/** Ab wie vielen Pixeln eine Bewegung als Richtung zählt. */
const SCHWELLE = 6;

/** Bis hierher gilt „ganz oben" — dort ist die Leiste immer sichtbar. */
const OBEN = 80;

export function FeedReiter({
  aktiv,
  fuerDich,
  folgeIch,
  entdecken,
}: {
  aktiv: Reiter;
  fuerDich: string;
  folgeIch: string;
  entdecken: string;
}) {
  const [sichtbar, setSichtbar] = useState(true);
  const zuletzt = useRef(0);

  useEffect(() => {
    zuletzt.current = window.scrollY;

    const beimScrollen = () => {
      const jetzt = window.scrollY;
      const weg = jetzt - zuletzt.current;

      if (Math.abs(weg) < SCHWELLE) return;

      setSichtbar(jetzt < OBEN || weg < 0);
      zuletzt.current = jetzt;
    };

    /* `passive`, damit das Scrollen nicht auf uns wartet. */
    window.addEventListener('scroll', beimScrollen, { passive: true });
    return () => window.removeEventListener('scroll', beimScrollen);
  }, []);

  const reiter: { wert: Reiter; wort: string; ziel: string; nurBreit?: boolean }[] = [
    { wert: 'fuerdich', wort: fuerDich, ziel: '/feed' },
    { wert: 'folgeich', wort: folgeIch, ziel: '/feed?reiter=folgeich' },
    /*
     * Am Handy nur zwei Reiter. Drei nebeneinander wären dort je
     * knapp über 100 px breit — treffbar, aber gedrängt, und die
     * Leiste würde zum Balken statt zum Umschalter. „Entdecken"
     * bleibt über die Adresse trotzdem erreichbar.
     */
    { wert: 'entdecken', wort: entdecken, ziel: '/feed?reiter=entdecken', nurBreit: true },
  ];

  return (
    <div className="feed-reiter-halter" data-sichtbar={sichtbar}>
      <nav className="feed-reiter">
        {reiter.map((r) => (
          <Link
            key={r.wert}
            href={r.ziel}
            data-aktiv={aktiv === r.wert}
            /* Nicht ausblenden, solange er der gewählte ist — sonst
               stünde man am Handy in einem Reiter, den man nicht
               sieht und nicht verlassen kann. */
            data-nur-breit={r.nurBreit && aktiv !== r.wert ? 'true' : undefined}
            aria-current={aktiv === r.wert ? 'page' : undefined}
            /* Der Reiter ist eine Ansicht derselben Seite, kein neues
               Ziel — der Bildlauf soll oben stehen bleiben. */
            scroll={false}
          >
            {r.wort}
          </Link>
        ))}
      </nav>

      <style jsx>{`
        .feed-reiter-halter {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          justify-content: center;
          padding: var(--space-8) 0 var(--space-16);
          /* Die Karten dürfen nicht unter der Leiste durchscheinen. */
          background: var(--surface-canvas);
          transition: transform var(--motion-feed), opacity var(--motion-feed);
        }
        .feed-reiter-halter[data-sichtbar='false'] {
          /* 140 % statt 100 %: der Schatten der Leiste soll mit weg. */
          transform: translateY(-140%);
          opacity: 0;
          /* Unsichtbar heißt auch untastbar — sonst fängt die Leiste
             Klicks ab, die der ersten Karte gelten. */
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .feed-reiter-halter {
            transition: none;
          }
        }

        .feed-reiter {
          display: flex;
          gap: 3px;
          padding: 4px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          background: var(--surface-raised);
        }
        /* :global(), weil styled-jsx <Link> nicht scopet — gescopet
           über .feed-reiter davor. Siehe src/styles/huelle.css. */
        .feed-reiter :global(a) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          /* Breiter und höher als die Reiter in der Suche: das hier ist
             der meistbenutzte Umschalter der App. */
          min-width: 132px;
          height: 40px;
          padding: 0 var(--space-24);
          border-radius: var(--radius-full);
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          text-decoration: none;
          white-space: nowrap;
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

        @media (max-width: 480px) {
          .feed-reiter :global(a) {
            min-width: 0;
            flex: 1;
            padding: 0 var(--space-16);
          }
          .feed-reiter {
            width: 100%;
          }
          .feed-reiter :global(a[data-nur-breit='true']) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
