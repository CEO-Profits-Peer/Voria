'use client';

/**
 * Setzt das Scrollverhalten des Feeds — nur solange er offen ist.
 *
 * Zwei Dinge auf einmal, weil beide dieselbe Klasse am `<html>`
 * brauchen: Die Scrollleiste gehört dem Sichtfeld, nicht einem
 * Element darin, und `scroll-snap-type` gilt für den Scrollbehälter.
 * Beim Feed ist das die Seite selbst.
 *
 * 1. KEINE SCROLLLEISTE. Der Feed lädt endlos nach. Eine Leiste,
 *    deren Griff bei jedem Nachladen kleiner wird, behauptet eine
 *    Länge, die es nicht gibt.
 *
 * 2. DIE WISCHBREMSE. Ein kräftiger Wisch soll höchstens eine Karte
 *    überspringen, nicht zwanzig. Das leistet `scroll-snap-stop`.
 *
 * WARUM DAS KEIN WIDERSPRUCH ZUR ENTSCHEIDUNG VOM 30.07. IST
 *
 * Damals wurde Scroll-Snap verworfen, mit dieser Begründung: „Snap
 * zwingt jeden Bildlauf in ein Raster. Das setzt gleich hohe Karten
 * voraus." Das stimmt für `mandatory` — und deshalb steht hier
 * `proximity`. Der Unterschied ist der ganze Punkt:
 *
 *   mandatory  — jede Ruhelage MUSS auf einer Karte liegen. Bei
 *                ungleich hohen Karten reißt das Lücken auf und
 *                schneidet lange Beiträge ab.
 *   proximity  — gefangen wird nur, wer ohnehin fast auf einer Karte
 *                steht. Überfliegen und zwischen zwei Karten
 *                stehenbleiben bleibt möglich.
 *
 * `scroll-snap-stop: always` wirkt trotzdem: Es verbietet, im Schwung
 * über Fangpunkte hinwegzufliegen. Genau das war gewünscht.
 *
 * Beides ist eine Zeile CSS und ohne Rest wieder zu entfernen. Wenn es
 * sich im Browser falsch anfühlt: `.feed-scrollen` in seiten.css
 * löschen, dann ist der Zustand von vorher zurück.
 */

import { useEffect } from 'react';

export function FeedScrollen() {
  useEffect(() => {
    document.documentElement.classList.add('feed-scrollen');
    return () => document.documentElement.classList.remove('feed-scrollen');
  }, []);

  return null;
}
