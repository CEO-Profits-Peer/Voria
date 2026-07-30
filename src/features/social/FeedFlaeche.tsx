'use client';

/**
 * Doppelklick ins Leere springt zum nächsten Beitrag.
 *
 * WARUM SO UND NICHT SCROLL-SNAP
 *
 * Snap zwingt jeden Bildlauf in ein Raster. Das setzt gleich hohe
 * Karten voraus — Voria hat aber Beiträge mit Foto, ohne Foto, mit
 * zwei Zeilen und mit langem Absatz. Auf variablen Höhen fühlt Snap
 * sich kaputt an: kurze Karten lassen Leerraum, lange werden
 * abgeschnitten, und beim Zurückscrollen landet man nicht dort, wo man
 * war. Vor allem nimmt Snap dem Leser die Kontrolle — überfliegen geht
 * dann nicht mehr.
 *
 * Der Doppelklick dreht das um: normal scrollt man frei, und wer
 * springen will, fordert es an. Kein Zwang, keine Mechanik im
 * Hintergrund.
 *
 * NUR INS LEERE. Ein Doppelklick auf Text markiert dort ein Wort —
 * das ist eine Erwartung, die man nicht brechen darf. Deshalb löst nur
 * ein Treffer auf die Fläche selbst aus, nicht auf eine Karte.
 *
 * Auf dem Handy passiert hier nichts: dort gibt es keinen Doppelklick,
 * und ein Doppeltipp ist für Zoom belegt. Das ist in Ordnung — die
 * Funktion ist eine Abkürzung, kein Weg, den man braucht.
 */

import { useRef } from 'react';

/** Abstand vom oberen Rand, ab dem eine Karte als „darunter" gilt. */
const SCHWELLE = 8;

export function FeedFlaeche({ children }: { children: React.ReactNode }) {
  const aussen = useRef<HTMLDivElement>(null);
  const strom = useRef<HTMLDivElement>(null);

  const springen = (e: React.MouseEvent<HTMLDivElement>) => {
    /*
     * Zwei Ebenen, weil `.strom` nur 620 px breit ist. Auf einem
     * großen Bildschirm liegt links und rechts davon viel Leere — und
     * genau dorthin klickt man. Der Griff sitzt deshalb außen, gilt
     * aber auch für die Lücken zwischen den Karten, die zu `.strom`
     * gehören.
     *
     * Alles andere — Karten, Text, Knöpfe — läuft weiter wie gewohnt.
     */
    const ziel_ = e.target;
    if (ziel_ !== aussen.current && ziel_ !== strom.current) return;

    const karten = strom.current?.children;
    if (!karten) return;

    /*
     * Die erste Karte, deren Oberkante unterhalb des Sichtfeldrands
     * liegt. `getBoundingClientRect().top` ist relativ zum Fenster,
     * also ist „> SCHWELLE" genau das, was noch kommt.
     *
     * Die Schwelle fängt den Fall ab, dass eine Karte bereits exakt
     * oben steht — sonst springt der Doppelklick auf der Stelle.
     */
    let ziel: Element | null = null;
    for (const karte of Array.from(karten)) {
      if (karte.getBoundingClientRect().top > SCHWELLE) {
        ziel = karte;
        break;
      }
    }

    // Am Ende angekommen: nichts tun, statt an den Anfang zu springen.
    if (!ziel) return;

    /*
     * `behavior: 'smooth'` respektiert `prefers-reduced-motion` in
     * allen aktuellen Browsern von selbst — wer Bewegung abgeschaltet
     * hat, bekommt einen harten Sprung statt gar keinen.
     */
    ziel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={aussen} className="strom-flaeche" onDoubleClick={springen}>
      <div ref={strom} className="strom">
        {children}
      </div>
    </div>
  );
}
