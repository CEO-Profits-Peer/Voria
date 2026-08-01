'use client';

/**
 * Die Einladung hinter dem einen öffentlichen Beitrag.
 *
 * ═══════════════════════════════════════════════════════════════
 * WARUM DAS KEIN WIDERSPRUCH ZU „DIE APP DRÄNGT NICHT" IST
 * ═══════════════════════════════════════════════════════════════
 *
 * Die Regel gilt der ANWENDUNG: Wer drin ist und schreibt, wird nicht
 * angestupst, nicht gezählt, nicht ermahnt. `/b/<id>` ist aber nicht
 * die Anwendung — es ist das Schaufenster. Jemand ist über einen Link
 * hier gelandet, hat einen fremden Tagebuchtag gelesen und will
 * weiter. Ihm zu sagen, wo es weitergeht, ist keine Zumutung, sondern
 * die Antwort auf seine Bewegung.
 *
 * Trotzdem mit Maß, und das steckt in drei Entscheidungen:
 *
 *   1. DER BEITRAG BLEIBT LESBAR. Nichts wird abgeschnitten,
 *      ausgegraut oder hinter Nebel gelegt. Wer nur diesen einen Tag
 *      lesen wollte, bekommt ihn ganz — sonst wäre der geteilte Link
 *      eine Falle, und niemand teilt Fallen.
 *
 *   2. ERST NACH DEM ENDE. Die Einladung erscheint, wenn jemand über
 *      den Beitrag hinaus liest — also wenn er tatsächlich mehr will.
 *      Nicht nach drei Sekunden, nicht beim Verlassen der Seite.
 *
 *   3. EINMAL, UND WEGKLICKBAR. Wer sie schließt, sieht sie in dieser
 *      Sitzung nicht wieder. Kein zweiter Anlauf, kein Zähler.
 *
 * Das ist auch der Grund, warum diese Seite überhaupt so wichtig ist:
 * Ein geteilter Tag ist der einzige Weg, auf dem Voria neue Leute
 * erreicht, ohne dass jemand Werbung schaltet.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function AnmeldeWand({
  titel,
  zeile,
  anlegen,
  anmelden,
  spaeter,
  schliessen,
}: {
  titel: string;
  zeile: string;
  anlegen: string;
  anmelden: string;
  spaeter: string;
  schliessen: string;
}) {
  const [offen, setOffen] = useState(false);
  const [erledigt, setErledigt] = useState(false);
  const wache = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ziel = wache.current;
    if (!ziel || erledigt) return;

    const beobachter = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOffen(true);
      },
      /* Erst wenn das Ende des Beitrags wirklich erreicht ist. */
      { threshold: 1 },
    );

    beobachter.observe(ziel);
    return () => beobachter.disconnect();
  }, [erledigt]);

  /* Escape schließt. Immer. */
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOffen(false);
        setErledigt(true);
      }
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, []);

  const zu = () => {
    setOffen(false);
    setErledigt(true);
  };

  return (
    <>
      {/* Die Wache steht am Ende des Beitrags. Ein Element ohne Höhe
          reicht nicht für `threshold: 1` — deshalb ein schmaler
          Streifen, den man nicht sieht. */}
      <div ref={wache} className="wand-wache" aria-hidden />

      {offen && !erledigt && (
        <div className="wand-grund" role="dialog" aria-modal="true" aria-label={titel}>
          <div className="wand-karte">
            <button type="button" className="wand-zu" onClick={zu} aria-label={schliessen}>
              <X size={18} strokeWidth={1.75} aria-hidden />
            </button>

            <h2>{titel}</h2>
            <p>{zeile}</p>

            <div className="wand-knoepfe">
              <Link href="/registrieren" className="wand-haupt">
                {anlegen}
              </Link>
              <Link href="/anmelden">{anmelden}</Link>
            </div>

            <button type="button" className="wand-spaeter" onClick={zu}>
              {spaeter}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
