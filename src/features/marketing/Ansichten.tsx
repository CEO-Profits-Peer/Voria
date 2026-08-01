'use client';

/**
 * Drei Ansichten der App auf der Startseite.
 *
 * KEINE BILDSCHIRMFOTOS, SONDERN DIE ECHTE OBERFLÄCHE.
 *
 * Ein Bildschirmfoto veraltet an dem Tag, an dem sich ein Abstand
 * ändert — und niemand merkt es, weil eine PNG-Datei nicht mitbaut.
 * Voria hat zwölf Regionen-Themes, hell und dunkel: Das wären
 * vierundzwanzig Bilder, die alle gleichzeitig veralten.
 *
 * Diese Ansichten benutzen dieselben Klassen und Tokens wie die App
 * selbst — `.region-surface`, `.ornament-divider`, `--font-display`.
 * Was sich in der App ändert, ändert sich hier mit. Sie wiegen
 * außerdem nichts und sind auf jedem Bildschirm scharf.
 *
 * Ehrlich bleibt es trotzdem: Es ist nicht der Log eines echten
 * Menschen, sondern ein Beispiel. Deshalb steht darunter, was man
 * sieht, und nicht „so sieht es bei dir aus".
 */

import { useState } from 'react';
import type { Region } from '@/themes/regions';
import { useT } from '@/i18n/Sprachraum';

type Blick = 'seite' | 'flaeche' | 'welt';

/** Die vier Regionen, die auf der Startseite gezeigt werden. */
const WELTEN: Region[] = ['nordeuropa', 'maghreb', 'ostasien', 'anden'];

export function Ansichten() {
  const { t } = useT();
  const [blick, setBlick] = useState<Blick>('seite');

  const reiter: { wert: Blick; wort: string }[] = [
    { wert: 'seite', wort: t.start.blickSeite },
    { wert: 'flaeche', wort: t.start.blickFlaeche },
    { wert: 'welt', wort: t.start.blickWelt },
  ];

  return (
    <section className="ansichten">
      <h2>{t.start.ansichtenTitel}</h2>
      <p className="ansichten-zeile">{t.start.ansichtenZeile}</p>

      <div className="ansicht-reiter" role="tablist" aria-label={t.start.ansichtenTitel}>
        {reiter.map((r) => (
          <button
            key={r.wert}
            type="button"
            role="tab"
            aria-selected={blick === r.wert}
            data-aktiv={blick === r.wert}
            onClick={() => setBlick(r.wert)}
          >
            {r.wort}
          </button>
        ))}
      </div>

      <div className="ansicht-rahmen">
        {/* Ein Fensterrand, wie ihn ein Browser hätte. Er macht aus
            der Fläche einen Ausschnitt und nicht bloß einen Kasten. */}
        <div className="ansicht-leiste" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        {blick === 'seite' && (
          <div className="region-surface ansicht-blatt" data-region="maghreb">
            <span className="ornament-corner" aria-hidden />
            <div className="ansicht-inhalt">
              <span className="ansicht-meta">{t.start.beispielOrt2}</span>
              <h3>{t.start.mockTitel}</h3>
              <p>{t.start.beispielText2}</p>
              <div className="ornament-divider" />
              <span className="ansicht-fuss">{t.teilen.privat}</span>
            </div>
          </div>
        )}

        {blick === 'flaeche' && (
          <div
            className="region-surface ansicht-flaeche"
            data-region="nordeuropa"
            data-flaeche="offen"
          >
            {/* Zettel und Sofortbilder, leicht gedreht — der
                Schuhkarton aus der Gesamtbeschreibung. */}
            <div className="zettel" style={{ '--dreh': '-2.5deg' } as React.CSSProperties}>
              {t.start.mockZettel1}
            </div>
            <div className="sofortbild" style={{ '--dreh': '3deg' } as React.CSSProperties}>
              <span className="sofortbild-flaeche" aria-hidden />
            </div>
            <div className="zettel schmal" style={{ '--dreh': '1.5deg' } as React.CSSProperties}>
              {t.start.mockZettel2}
            </div>
          </div>
        )}

        {blick === 'welt' && (
          <div className="ansicht-welt">
            {WELTEN.map((r) => (
              <div key={r} className="region-surface welt-feld" data-region={r}>
                <span className="welt-punkt" aria-hidden />
                <span className="welt-name">{t.regionen[r]}</span>
              </div>
            ))}
            {/* Zwei blasse Felder: nicht jede Region ist bereist, und
                genau das ist die Aussage der Karte. */}
            <div className="welt-feld welt-blass" aria-hidden />
            <div className="welt-feld welt-blass" aria-hidden />
          </div>
        )}
      </div>

      <p className="ansicht-fein">{t.start.ansichtenFein}</p>
    </section>
  );
}
