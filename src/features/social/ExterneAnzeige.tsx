'use client';

/**
 * Ein Platz für ein Werbenetz.
 *
 * ═══════════════════════════════════════════════════════════════
 * LIES DAS, BEVOR DU HIER EIN NETZWERK EINTRÄGST.
 * ═══════════════════════════════════════════════════════════════
 *
 * In `/datenschutz` steht heute wörtlich:
 *
 *   „Anzeigen erscheinen ausschließlich im Feed und werden OHNE
 *    NUTZERDATEN ausgespielt — es gibt keine Zielgruppenbildung und
 *    keine Zählpixel."
 *   „Kein Tracking über Seiten hinweg, keine Analyse-Skripte."
 *
 * Die großen Werbenetze tun genau das Gegenteil. Google AdSense,
 * Media.net und die meisten anderen setzen Cookies von Dritten,
 * bilden Profile über Seiten hinweg und zählen mit Pixeln. Wer eines
 * davon einbindet, macht die eigene Datenschutzerklärung FALSCH —
 * und das ist in der EU kein Schönheitsfehler, sondern ein Verstoß.
 *
 * ZWEI WEGE, DIE GEHEN:
 *
 *   a) Ein Netz OHNE Verfolgung. Es gibt sie — sie spielen rein
 *      kontextfrei aus und setzen keine Cookies. Die Erlöse liegen
 *      im selben Bereich wie die genannten 0,50 bis 2 € je tausend
 *      Sichtkontakte, teils darüber, weil kein Zwischenhändler
 *      mitverdient.
 *
 *   b) Direktverkauf. Kein Skript, kein Dritter — die Anzeige liegt
 *      dann in `werbung.ts` wie die eigene. Bringt fünf- bis
 *      zehnmal so viel, kostet aber Gespräche.
 *
 * WAS NICHT GEHT: ein verfolgendes Netz einbinden und die
 * Datenschutzerklärung so lassen. Wer das will, muss ZUERST
 * `/datenschutz` umschreiben, eine Einwilligung einholen und
 * akzeptieren, dass Voria damit sein deutlichstes Versprechen
 * aufgibt.
 *
 * ═══════════════════════════════════════════════════════════════
 *
 * Eingeschaltet über `NEXT_PUBLIC_WERBENETZ` (die Adresse des
 * Skripts). Ohne die Variable passiert hier gar nichts — der Platz
 * bleibt leer und der Feed zeigt weiter die eigenen Anzeigen.
 */

import { useEffect, useRef } from 'react';

export function ExterneAnzeige({ kennzeichen }: { kennzeichen: string }) {
  const quelle = process.env.NEXT_PUBLIC_WERBENETZ;
  const platz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quelle || !platz.current) return;
    /* Nur einmal einhängen, auch wenn React den Effekt zweimal
       ausführt — im Entwicklungsmodus tut es das absichtlich. */
    if (platz.current.childElementCount > 0) return;

    const skript = document.createElement('script');
    skript.src = quelle;
    skript.async = true;
    platz.current.appendChild(skript);
  }, [quelle]);

  if (!quelle) return null;

  return (
    <aside className="vo-anzeige" aria-label={kennzeichen}>
      <div className="vo-anzeige-kopf">
        <span className="vo-anzeige-marke">{kennzeichen}</span>
      </div>
      {/*
        Feste Mindesthöhe: Ohne sie springt der Feed, sobald das
        Skript geladen hat und seine Karte einsetzt. Ein Sprung im
        Bildlauf ist das Unangenehmste, was Werbung anrichten kann —
        man liest gerade und verliert die Zeile.
      */}
      <div ref={platz} className="vo-anzeige-extern" />
    </aside>
  );
}
