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
import { SEITE } from './konstanten';
import { mehrBeitraege } from './actions';
import { mitAnzeigen } from './werbung';
import { BeitragKarte } from './BeitragKarte';
import { AnzeigeKarte } from './AnzeigeKarte';

export function FeedStrom({
  start,
  werbung,
  kennzeichen,
}: {
  start: Beitrag[];
  werbung: boolean;
  kennzeichen: string;
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
        mehrBeitraege(beitraege.length)
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
  }, [beitraege.length, nochWelche]);

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
    </>
  );
}
