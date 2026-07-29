'use client';

/**
 * Der Open Space — die freie Fläche.
 *
 * Kein Raster, kein Einrasten, keine Ausrichtungshilfen, keine Ebenenliste,
 * keine Werkzeugpalette. Das ist kein Grafikprogramm.
 *
 * EINHÄNDIGKEIT, die offene Stelle aus Schritt 3:
 * Griffe sitzen am Objekt, und Objekte liegen oft oben — Drehen und
 * Skalieren sind deshalb bewusst Zwei-Hand-Gesten. Antippen, Verschieben
 * und Hinzufügen bleiben einhändig.
 *
 * Dafür ist das Verschieben entkoppelt: langes Drücken hebt ein Element auf,
 * es klebt am Daumen, die Fläche darunter lässt sich weiterschieben, ein
 * zweites Tippen legt es ab. So kommt auch der obere Rand in Reichweite,
 * ohne dass man umgreifen muss.
 *
 * Die Fläche zoomt nicht, sie scrollt nur — sonst kollidiert Zwei-Finger-
 * Drehen am Objekt mit Zwei-Finger-Zoomen der Fläche.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, Maximize2, Trash2, Hand, Plus } from 'lucide-react';
import type { Block } from './queries';
import { layoutSpeichern, blockLoeschen } from './actions';
import { FotoBild } from './FotoBild';

interface Lage {
  x: number;
  y: number;
  w: number;
  h: number;
  drehung: number;
  z: number;
}

const STANDARD: Lage = { x: 40, y: 80, w: 220, h: 160, drehung: -2, z: 0 };

export function OpenSpace({
  bloecke,
  aufHinzufuegen,
}: {
  bloecke: Block[];
  aufHinzufuegen: () => void;
}) {
  const flaeche = useRef<HTMLDivElement>(null);
  const [lagen, setLagen] = useState<Record<string, Lage>>(() =>
    Object.fromEntries(
      bloecke.map((b) => [
        b.id,
        {
          x: b.x ?? STANDARD.x + (b.position % 3) * 24,
          y: b.y ?? STANDARD.y + b.position * 150,
          w: b.w ?? (b.art === 'text' ? 240 : 220),
          h: b.h ?? (b.art === 'text' ? 90 : 160),
          drehung: b.drehung ?? 0,
          z: b.z ?? b.position,
        },
      ]),
    ),
  );
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [aufgehoben, setAufgehoben] = useState<string | null>(null);
  const zieh = useRef<{ id: string; dx: number; dy: number; art: 'move' | 'size' | 'rot' } | null>(null);
  const halten = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sichern = useCallback((id: string, l: Lage) => {
    layoutSpeichern(id, { x: l.x, y: l.y, w: l.w, h: l.h, rotation: l.drehung, z: l.z });
  }, []);

  /* ---- Aufheben und Ablegen ------------------------------- */

  const aufheben = (id: string) => {
    setAufgehoben(id);
    setGewaehlt(id);
    if (navigator.vibrate) navigator.vibrate(12);
  };

  const ablegen = useCallback(() => {
    if (!aufgehoben) return;
    sichern(aufgehoben, lagen[aufgehoben]);
    setAufgehoben(null);
    if (navigator.vibrate) navigator.vibrate(8);
  }, [aufgehoben, lagen, sichern]);

  // Solange etwas aufgehoben ist, folgt es dem Finger.
  useEffect(() => {
    if (!aufgehoben) return;

    const folgen = (e: PointerEvent) => {
      const kasten = flaeche.current?.getBoundingClientRect();
      if (!kasten) return;
      setLagen((v) => {
        const l = v[aufgehoben];
        return {
          ...v,
          [aufgehoben]: {
            ...l,
            x: e.clientX - kasten.left - l.w / 2,
            y: e.clientY - kasten.top + (flaeche.current?.scrollTop ?? 0) - l.h / 2,
          },
        };
      });
    };

    window.addEventListener('pointermove', folgen);
    return () => window.removeEventListener('pointermove', folgen);
  }, [aufgehoben]);

  /* ---- Ziehen, Drehen, Skalieren -------------------------- */

  useEffect(() => {
    const bewegen = (e: PointerEvent) => {
      const z = zieh.current;
      if (!z) return;
      const kasten = flaeche.current?.getBoundingClientRect();
      if (!kasten) return;

      setLagen((v) => {
        const l = v[z.id];
        if (z.art === 'move') {
          return { ...v, [z.id]: { ...l, x: e.clientX - kasten.left - z.dx, y: e.clientY - kasten.top - z.dy } };
        }
        if (z.art === 'size') {
          const breite = Math.max(80, e.clientX - kasten.left - l.x);
          return { ...v, [z.id]: { ...l, w: breite, h: breite * (l.h / l.w) } };
        }
        const mx = l.x + l.w / 2;
        const my = l.y + l.h / 2;
        const grad = (Math.atan2(e.clientY - kasten.top - my, e.clientX - kasten.left - mx) * 180) / Math.PI;
        // Kurzer Widerstand bei 0 Grad, aber kein Einrasten.
        const roh = grad + 135;
        const gedreht = Math.abs(roh) < 3 ? 0 : Math.max(-8, Math.min(8, roh));
        return { ...v, [z.id]: { ...l, drehung: gedreht } };
      });
    };

    const loslassen = () => {
      const z = zieh.current;
      if (z) sichern(z.id, lagen[z.id]);
      zieh.current = null;
    };

    window.addEventListener('pointermove', bewegen);
    window.addEventListener('pointerup', loslassen);
    return () => {
      window.removeEventListener('pointermove', bewegen);
      window.removeEventListener('pointerup', loslassen);
    };
  }, [lagen, sichern]);

  const starten = (e: React.PointerEvent, id: string, art: 'move' | 'size' | 'rot') => {
    if (aufgehoben) return;
    e.stopPropagation();
    const kasten = flaeche.current?.getBoundingClientRect();
    if (!kasten) return;
    const l = lagen[id];
    zieh.current = { id, art, dx: e.clientX - kasten.left - l.x, dy: e.clientY - kasten.top - l.y };
    setGewaehlt(id);
  };

  return (
    <div
      ref={flaeche}
      className="flaeche region-surface"
      data-flaeche="offen"
      onPointerDown={() => {
        if (aufgehoben) ablegen();
        else setGewaehlt(null);
      }}
    >
      {bloecke.map((b) => {
        const l = lagen[b.id];
        const aktiv = gewaehlt === b.id;
        const schwebt = aufgehoben === b.id;

        return (
          <div
            key={b.id}
            className="element"
            data-aktiv={aktiv}
            data-schwebt={schwebt}
            style={{
              left: l.x,
              top: l.y,
              width: l.w,
              zIndex: schwebt ? 999 : l.z + 1,
              transform: `rotate(${l.drehung}deg)`,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (aufgehoben === b.id) {
                ablegen();
                return;
              }
              setGewaehlt(b.id);
              starten(e, b.id, 'move');
              halten.current = setTimeout(() => aufheben(b.id), 480);
            }}
            onPointerUp={() => halten.current && clearTimeout(halten.current)}
            onPointerLeave={() => halten.current && clearTimeout(halten.current)}
          >
            {b.art === 'photo' && b.foto ? (
              <FotoBild foto={b.foto} polaroid />
            ) : (
              <p className="notiz">{b.text}</p>
            )}

            {aktiv && !schwebt && (
              <>
                <span className="rahmen" aria-hidden />
                <button
                  type="button"
                  className="griff dreh"
                  aria-label="Drehen"
                  onPointerDown={(e) => starten(e, b.id, 'rot')}
                >
                  <RotateCw size={14} strokeWidth={1.75} aria-hidden />
                </button>
                <button
                  type="button"
                  className="griff groesse"
                  aria-label="Größe ändern"
                  onPointerDown={(e) => starten(e, b.id, 'size')}
                >
                  <Maximize2 size={14} strokeWidth={1.75} aria-hidden />
                </button>
                <button
                  type="button"
                  className="griff weg"
                  aria-label="Entfernen"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    blockLoeschen(b.id);
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                </button>
              </>
            )}
          </div>
        );
      })}

      {aufgehoben && (
        <div className="hinweis" role="status">
          <Hand size={16} strokeWidth={1.5} aria-hidden />
          Tippen zum Ablegen — die Fläche lässt sich weiterschieben
        </div>
      )}

      {/* Ein Knopf im Daumenbereich, drei Angebote — keine Werkzeugleiste. */}
      {!aufgehoben && (
        <button
          type="button"
          className="dazu"
          aria-label="Etwas hinzufügen"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={aufHinzufuegen}
        >
          <Plus size={24} strokeWidth={1.5} aria-hidden />
        </button>
      )}

      <style jsx>{`
        .flaeche {
          position: relative;
          min-height: 70dvh;
          overflow-y: auto;
          overscroll-behavior: contain;
          touch-action: pan-y;
        }
        .element {
          position: absolute;
          cursor: grab;
          touch-action: none;
          transition: box-shadow var(--motion-feed), transform var(--motion-feed);
        }
        .element[data-schwebt='true'] {
          cursor: grabbing;
          transform-origin: center;
          filter: drop-shadow(0 12px 28px rgb(21 19 17 / 0.28));
          transition: none;
        }
        .notiz {
          margin: 0;
          padding: var(--space-12) var(--space-16);
          background: var(--raised-tint, var(--surface-raised));
          border-radius: 2px;
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-primary);
          box-shadow: 0 1px 6px rgb(21 19 17 / 0.1);
        }
        .rahmen {
          position: absolute;
          inset: -6px;
          border: 1.5px solid var(--accent-primary);
          border-radius: var(--radius-4);
          pointer-events: none;
        }
        .griff {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: var(--radius-full);
          border: 1px solid var(--accent-primary);
          background: var(--surface-raised);
          color: var(--accent-primary);
          cursor: pointer;
          touch-action: none;
        }
        /* Trefferfläche 44 px, sichtbar bleiben 26 px. */
        .griff::after {
          content: '';
          position: absolute;
          inset: -9px;
        }
        .dreh {
          left: -19px;
          bottom: -19px;
        }
        .groesse {
          right: -19px;
          bottom: -19px;
        }
        .weg {
          right: -19px;
          top: -19px;
        }
        .dazu {
          position: fixed;
          bottom: calc(88px + env(safe-area-inset-bottom));
          right: var(--space-20);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border: 1px solid var(--accent-primary);
          border-radius: var(--radius-full);
          background: var(--accent-primary);
          color: var(--accent-contrast);
          cursor: pointer;
          z-index: 900;
          transition: background var(--motion-feed);
        }
        .dazu:hover {
          background: var(--accent-hover);
        }
        .hinweis {
          position: sticky;
          bottom: var(--space-16);
          margin: 0 auto;
          width: fit-content;
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-12) var(--space-20);
          border-radius: var(--radius-full);
          background: var(--surface-inverse);
          color: var(--content-inverse);
          font-size: var(--size-14);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
}
