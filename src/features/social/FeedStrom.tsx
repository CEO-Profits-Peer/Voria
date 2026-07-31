'use client';

/**
 * Der Feed lädt nach, statt alles auf einmal zu holen.
 *
 * Ausgelöst wird beim **ersten Beitrag des letzten Stapels**, nicht am
 * Ende der Liste. Dann liegen noch neun Karten vor dem Leser, und der
 * nächste Stapel ist da, bevor er unten ankommt. Ein Auslöser ganz
 * unten würde jedes Mal eine Wartepause erzeugen.
 *
 * WARUM DIE ANZEIGEN HIER GEMISCHT WERDEN UND NICHT JE STAPEL
 *
 * `mitAnzeigen` kennt vier Regeln, zwei davon beziehen sich auf die
 * ganze Liste: nie die erste Karte, nie die letzte. Mischte man je
 * Stapel, hieße „letzte Karte" jedes Mal die zehnte — und an jeder
 * Stapelgrenze stünde die Anzeige falsch. Deshalb wird über den
 * gesamten angesammelten Bestand gemischt, bei jedem Nachladen neu.
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import type { Beitrag } from './queries';
import { SEITE, type Reiter } from './konstanten';
import { mehrBeitraege, alsGelesenMerken } from './actions';
import { mitAnzeigen } from './werbung';
import { BeitragKarte } from './BeitragKarte';
import { AnzeigeKarte } from './AnzeigeKarte';

export function FeedStrom({
  start,
  werbung,
  kennzeichen,
  reiter,
  ende,
}: {
  start: Beitrag[];
  werbung: boolean;
  kennzeichen: string;
  reiter: Reiter;
  /** Der Satz, der ganz unten steht, wenn nichts mehr kommt. */
  ende: string;
}) {
  const [beitraege, setBeitraege] = useState(start);
  /* Weniger als ein voller Stapel heißt: das war alles. */
  const [nochWelche, setNochWelche] = useState(start.length >= SEITE);
  const wache = useRef<HTMLDivElement>(null);
  const laeuft = useRef(false);

  useEffect(() => {
    const ziel = wache.current;
    if (!ziel || !nochWelche) return;

    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (!eintrag.isIntersecting || laeuft.current) return;

        /*
         * Die Sperre ist ein `ref`, kein `useState`: der Beobachter
         * kann zweimal feuern, bevor React neu gerendert hat, und
         * dann liefe derselbe Stapel doppelt los.
         */
        laeuft.current = true;
        mehrBeitraege(beitraege.length, reiter)
          .then((neue) => {
            if (neue.length < SEITE) setNochWelche(false);
            if (neue.length > 0) {
              /*
               * Nach ID abgleichen. Kommt zwischen zwei Abfragen ein
               * Beitrag dazu, verschiebt sich das Fenster, und ohne
               * diese Prüfung stünde einer zweimal im Feed — React
               * würde ihn mit doppeltem Schlüssel verwerfen.
               */
              setBeitraege((bisher) => {
                const da = new Set(bisher.map((b) => b.id));
                return [...bisher, ...neue.filter((b) => !da.has(b.id))];
              });
            }
          })
          .finally(() => {
            laeuft.current = false;
          });
      },
      /* Etwas Vorlauf, damit im Ruhezustand nachgeladen wird. */
      { rootMargin: '400px' },
    );

    beobachter.observe(ziel);
    return () => beobachter.disconnect();
  }, [beitraege.length, nochWelche, reiter]);

  /*
   * GELESEN MERKEN
   *
   * Was auf dem Schirm stand, gilt als gesehen. Gemeldet wird
   * gesammelt und verzögert, nicht je Karte — beim Scrollen wären das
   * sonst zwanzig Anfragen in zehn Sekunden.
   *
   * Der Vermerk ändert die Reihenfolge ABSICHTLICH nicht sofort. Sonst
   * rutschten die Karten unter dem Finger weg, während man sie liest.
   * Er wirkt beim nächsten Öffnen — und das ist der ganze Zweck.
   */
  const gesehen = useRef(new Set<string>());
  const offen = useRef(new Set<string>());

  useEffect(() => {
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          const id = (e.target as HTMLElement).dataset.beitrag;
          if (!e.isIntersecting || !id || gesehen.current.has(id)) continue;
          gesehen.current.add(id);
          offen.current.add(id);
        }
      },
      /* Mindestens die Hälfte der Karte, sonst zählt Vorbeischießen. */
      { threshold: 0.5 },
    );

    /* Über das Merkmal statt über eine Klasse: `.strom` gehört
       FeedFlaeche, und diese Komponente soll dessen Aufbau nicht
       kennen müssen. */
    document.querySelectorAll('[data-beitrag]').forEach((k) => beobachter.observe(k));

    /* Alle fünf Sekunden nachreichen, was sich angesammelt hat. */
    const uhr = setInterval(() => {
      if (offen.current.size === 0) return;
      const stapel = [...offen.current];
      offen.current.clear();
      alsGelesenMerken(stapel);
    }, 5000);

    return () => {
      beobachter.disconnect();
      clearInterval(uhr);
      /* Beim Verlassen der Seite den Rest nachschicken. */
      if (offen.current.size > 0) alsGelesenMerken([...offen.current]);
    };
  }, [beitraege.length]);

  const karten = werbung
    ? mitAnzeigen(beitraege)
    : beitraege.map((wert) => ({ art: 'beitrag' as const, wert }));

  /*
   * Wo die Wache steht: beim ersten Beitrag des letzten Stapels. In der
   * gemischten Liste ist das nicht derselbe Platz wie in der reinen —
   * deshalb wird bis dorthin gezählt statt gerechnet.
   */
  const wacheBeiBeitrag = Math.max(0, beitraege.length - SEITE);
  let gezaehlt = -1;
  const wachePlatz = karten.findIndex(
    (k) => k.art === 'beitrag' && ++gezaehlt === wacheBeiBeitrag,
  );

  return (
    <>
      {/*
        Fragment statt eines Wrappers: die Karten müssen direkte Kinder
        von `.strom` bleiben, sonst findet der Doppelklick sie nicht.
      */}
      {karten.map((k, i) => (
        <Fragment key={k.art === 'beitrag' ? k.wert.id : `${k.wert.id}-${i}`}>
          {i === wachePlatz && <div ref={wache} data-wache aria-hidden />}
          {k.art === 'beitrag' ? (
            <BeitragKarte beitrag={k.wert} />
          ) : (
            <AnzeigeKarte anzeige={k.wert} kennzeichen={kennzeichen} />
          )}
        </Fragment>
      ))}

      {/*
        DAS ENDE, ALS SATZ.

        Vorher hörte die Liste einfach auf — kein Wort, nichts. Das
        sieht aus wie ein Ladefehler, und man scrollt weiter und
        wartet.

        Es wäre ein Leichtes, hier stattdessen von vorne zu beginnen
        und den Feed unendlich WIRKEN zu lassen. Dagegen spricht:
        Dieselben Beiträge ein zweites Mal erkennt jeder sofort, und
        dann fühlt es sich nicht nach viel Inhalt an, sondern nach
        kaputt. Das Ende verschwindet ohnehin von selbst, sobald genug
        Leute schreiben.

        Erst ab der zweiten Ladung. Bei drei Beiträgen im Feed wäre
        „das war alles" eine Bemerkung über die Leere.
      */}
      {!nochWelche && beitraege.length > SEITE && (
        <p className="ende" data-wache>
          {ende}
          <style jsx>{`
            .ende {
              margin: 0;
              padding: var(--space-32) var(--space-24) var(--space-48);
              text-align: center;
              font-family: var(--font-ui);
              font-size: var(--size-14);
              line-height: var(--leading-normal);
              color: var(--content-muted);
              text-wrap: pretty;
            }
          `}</style>
        </p>
      )}
    </>
  );
}
