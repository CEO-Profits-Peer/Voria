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
 *
 * TEXT: Der Plus-Knopf bot vorher nur Fotos an — auf der freien Fläche
 * ließ sich überhaupt kein Text anlegen, obwohl `blocks` das seit dem
 * ersten Entwurf kann. Jetzt fragt er zuerst: Text oder Foto.
 *
 * Geschrieben wird im Block selbst. Solange getippt wird, sind Ziehen,
 * Drehen und Aufheben abgeschaltet — sonst rutscht die Notiz beim
 * Setzen des Cursors weg. Der Stiftgriff schaltet um.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, Maximize2, Trash2, Hand, Plus, Pencil, Check, Type, ImagePlus } from 'lucide-react';
import type { Block } from './queries';
import { layoutSpeichern, blockLoeschen, textBlockAnlegen, textSpeichern } from './actions';
import { FotoBild } from './FotoBild';
import { useT } from '@/i18n/Sprachraum';

interface Lage {
  x: number;
  y: number;
  w: number;
  h: number;
  drehung: number;
  z: number;
}

const STANDARD: Lage = { x: 40, y: 80, w: 220, h: 160, drehung: -2, z: 0 };

/** Lage eines Blocks aus den gespeicherten Werten, mit Rückfall. */
function lageVon(b: Block): Lage {
  return {
    x: b.x ?? STANDARD.x + (b.position % 3) * 24,
    y: b.y ?? STANDARD.y + b.position * 150,
    w: b.w ?? (b.art === 'text' ? 240 : 220),
    h: b.h ?? (b.art === 'text' ? 90 : 160),
    drehung: b.drehung ?? 0,
    z: b.z ?? b.position,
  };
}

export function OpenSpace({
  eintragId,
  bloecke,
  aufFotoWaehlen,
}: {
  eintragId: string;
  bloecke: Block[];
  aufFotoWaehlen: () => void;
}) {
  const { t } = useT();
  const flaeche = useRef<HTMLDivElement>(null);
  const [lagen, setLagen] = useState<Record<string, Lage>>(() =>
    Object.fromEntries(bloecke.map((b) => [b.id, lageVon(b)])),
  );

  /*
   * Neue Blöcke in die Lagen aufnehmen.
   *
   * `lagen` wurde nur beim ersten Rendern gefüllt. Kam danach ein Block
   * hinzu — durch ein Foto aus dem Wähler oder jetzt durch Text — stand
   * unter seiner ID nichts, und `lagen[b.id].x` lief in einen
   * TypeError. Die Fläche stürzte ab, sobald man ein Foto einfügte.
   */
  useEffect(() => {
    setLagen((v) => {
      let geaendert = false;
      const naechste = { ...v };
      for (const b of bloecke) {
        if (!naechste[b.id]) {
          naechste[b.id] = lageVon(b);
          geaendert = true;
        }
      }
      // Gelöschte wieder loswerden, sonst wächst das Objekt endlos.
      for (const id of Object.keys(naechste)) {
        if (!bloecke.some((b) => b.id === id)) {
          delete naechste[id];
          geaendert = true;
        }
      }
      return geaendert ? naechste : v;
    });
  }, [bloecke]);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [aufgehoben, setAufgehoben] = useState<string | null>(null);
  /** Block, in dem gerade geschrieben wird. Sperrt Ziehen und Drehen. */
  const [schreibt, setSchreibt] = useState<string | null>(null);
  const [menueOffen, setMenueOffen] = useState(false);
  /** Texte im Zugriff, damit das Tippen nicht auf den Server wartet. */
  const [texte, setTexte] = useState<Record<string, string>>({});
  const uhren = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const zieh = useRef<{ id: string; dx: number; dy: number; art: 'move' | 'size' | 'rot' } | null>(null);
  const halten = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sichern = useCallback((id: string, l: Lage) => {
    layoutSpeichern(id, { x: l.x, y: l.y, w: l.w, h: l.h, rotation: l.drehung, z: l.z });
  }, []);

  /*
   * Kein Speichern-Knopf, wie im ruhigen Modus. 700 ms nach dem letzten
   * Anschlag geht der Text weg. Pro Block eine eigene Uhr, sonst
   * verschluckt das Tippen im zweiten Block das Sichern des ersten.
   */
  const textTippen = useCallback(
    (blockId: string, wert: string) => {
      setTexte((v) => ({ ...v, [blockId]: wert }));
      clearTimeout(uhren.current[blockId]);
      uhren.current[blockId] = setTimeout(() => {
        textSpeichern(eintragId, blockId, wert);
      }, 700);
    },
    [eintragId],
  );

  // Beim Verlassen nichts liegen lassen.
  useEffect(() => {
    const offen = uhren.current;
    return () => Object.values(offen).forEach(clearTimeout);
  }, []);

  const textDazu = async () => {
    setMenueOffen(false);
    const kasten = flaeche.current?.getBoundingClientRect();
    const rollen = flaeche.current?.scrollTop ?? 0;
    // Etwas oberhalb der Mitte, damit die Tastatur nicht darüber liegt.
    const lage = {
      x: Math.max(16, Math.round(((kasten?.width ?? 360) - 240) / 2)),
      y: Math.round(rollen + 120),
      w: 240,
      h: 90,
    };
    const id = await textBlockAnlegen(eintragId, lage);
    if (!id) return;
    setLagen((v) => ({ ...v, [id]: { ...lage, drehung: 0, z: 50 } }));
    setTexte((v) => ({ ...v, [id]: '' }));
    setGewaehlt(id);
    setSchreibt(id);
  };

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
    if (aufgehoben || schreibt === id) return;
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
        if (aufgehoben) {
          ablegen();
          return;
        }
        setMenueOffen(false);
        setSchreibt(null);
        setGewaehlt(null);
      }}
    >
      {bloecke.map((b) => {
        // Rückfall, falls der Block gerade erst dazugekommen ist und
        // der Effekt oben noch nicht gelaufen ist.
        const l = lagen[b.id] ?? lageVon(b);
        const aktiv = gewaehlt === b.id;
        const schwebt = aufgehoben === b.id;
        const imText = schreibt === b.id;

        return (
          <div
            key={b.id}
            className="element"
            data-aktiv={aktiv}
            data-schwebt={schwebt}
            data-schreibt={imText}
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
              // Im Schreibmodus darf der Block nicht wegrutschen,
              // wenn man den Cursor setzt.
              if (imText) return;
              setGewaehlt(b.id);
              starten(e, b.id, 'move');
              halten.current = setTimeout(() => aufheben(b.id), 480);
            }}
            onPointerUp={() => halten.current && clearTimeout(halten.current)}
            onPointerLeave={() => halten.current && clearTimeout(halten.current)}
          >
            {b.art === 'photo' && b.foto ? (
              <FotoBild foto={b.foto} polaroid />
            ) : imText ? (
              <textarea
                className="notiz notiz-feld"
                value={texte[b.id] ?? b.text ?? ''}
                onChange={(e) => textTippen(b.id, e.target.value)}
                placeholder={t.log.notizLeer}
                aria-label={t.log.notizSchreiben}
                autoFocus
                style={{ height: l.h }}
                onPointerDown={(e) => e.stopPropagation()}
              />
            ) : (
              <p className="notiz">{texte[b.id] ?? b.text}</p>
            )}

            {aktiv && !schwebt && (
              <>
                <span className="rahmen" aria-hidden />

                {b.art === 'text' && (
                  <button
                    type="button"
                    className="griff stift"
                    aria-label={imText ? t.log.schreibenBeenden : t.log.notizSchreiben}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSchreibt(imText ? null : b.id);
                    }}
                  >
                    {imText ? (
                      <Check size={14} strokeWidth={2} aria-hidden />
                    ) : (
                      <Pencil size={14} strokeWidth={1.75} aria-hidden />
                    )}
                  </button>
                )}

                {!imText && (
                  <>
                    <button
                      type="button"
                      className="griff dreh"
                      aria-label={t.log.drehen}
                      onPointerDown={(e) => starten(e, b.id, 'rot')}
                    >
                      <RotateCw size={14} strokeWidth={1.75} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="griff groesse"
                      aria-label={t.log.groesseAendern}
                      onPointerDown={(e) => starten(e, b.id, 'size')}
                    >
                      <Maximize2 size={14} strokeWidth={1.75} aria-hidden />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="griff weg"
                  aria-label={t.log.entfernen}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSchreibt(null);
                    setGewaehlt(null);
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
          {t.log.ablegenHinweis}
        </div>
      )}

      {/* Ein Knopf im Daumenbereich, zwei Angebote — keine Werkzeugleiste. */}
      {!aufgehoben && !schreibt && (
        <div className="dazu-bereich">
          {menueOffen && (
            <div className="dazu-menue" role="menu">
              <button type="button" role="menuitem" onPointerDown={(e) => e.stopPropagation()} onClick={textDazu}>
                <Type size={17} strokeWidth={1.75} aria-hidden />
                {t.log.textDazu}
              </button>
              <button
                type="button"
                role="menuitem"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setMenueOffen(false);
                  aufFotoWaehlen();
                }}
              >
                <ImagePlus size={17} strokeWidth={1.75} aria-hidden />
                {t.log.fotoDazu}
              </button>
            </div>
          )}

          <button
            type="button"
            className="dazu"
            aria-label={t.log.etwasHinzufuegen}
            aria-expanded={menueOffen}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMenueOffen((v) => !v)}
          >
            <Plus size={24} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
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
          /* Zeilenumbrüche und Leerzeilen so zeigen, wie getippt. */
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
        /* Das Textfeld sieht aus wie die Notiz — nur eben beschreibbar.
           Gleiche Schrift und gleicher Innenabstand, sonst springt der
           Text beim Umschalten. */
        .notiz-feld {
          display: block;
          width: 100%;
          min-height: 60px;
          border: none;
          outline: none;
          resize: none;
          font-family: var(--font-text);
          touch-action: auto;
          cursor: text;
        }
        .notiz-feld::placeholder {
          color: var(--content-muted);
        }
        .element[data-schreibt='true'] {
          cursor: text;
          z-index: 800;
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
        .stift {
          left: -19px;
          top: -19px;
        }
        .dazu-bereich {
          position: fixed;
          bottom: calc(88px + env(safe-area-inset-bottom));
          right: var(--space-20);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--space-8);
          z-index: 900;
        }
        .dazu-menue {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 6px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          box-shadow: 0 8px 24px rgb(21 19 17 / 0.22);
        }
        .dazu-menue button {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          /* 44 px hoch — Fingergröße, nicht Mausgröße. */
          height: 44px;
          padding: 0 var(--space-16) 0 var(--space-12);
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: 14px;
          font-weight: var(--weight-medium);
          white-space: nowrap;
          cursor: pointer;
        }
        .dazu-menue button:hover {
          background: var(--surface-sunken);
        }
        .dazu {
          position: relative;
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
