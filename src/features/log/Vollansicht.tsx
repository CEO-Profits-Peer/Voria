'use client';

/**
 * Ein Foto groß.
 *
 * Wischen, Pfeiltasten, Escape. Der Grund ist dunkel und ruhig — hier
 * gewinnt das Bild, nicht die Oberfläche. Keine Werkzeugleiste, kein
 * Zähler, der aufdringlich ist.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FotoBild } from './FotoBild';
import { useT } from '@/i18n/Sprachraum';

interface Foto {
  id: string;
  pfad: string;
  breite: number;
  hoehe: number;
  blurhash: string | null;
}

export function Vollansicht({
  fotos,
  start,
  aufSchliessen,
}: {
  fotos: Foto[];
  start: number;
  aufSchliessen: () => void;
}) {
  const { t } = useT();
  const [i, setI] = useState(start);
  const beruehrt = useRef<number | null>(null);

  const weiter = useCallback(() => setI((v) => Math.min(v + 1, fotos.length - 1)), [fotos.length]);
  const zurueck = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aufSchliessen();
      if (e.key === 'ArrowRight') weiter();
      if (e.key === 'ArrowLeft') zurueck();
    };
    window.addEventListener('keydown', taste);
    // Hintergrund nicht mitscrollen lassen.
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', taste);
      document.body.style.overflow = vorher;
    };
  }, [aufSchliessen, weiter, zurueck]);

  if (fotos.length === 0) return null;
  const foto = fotos[i];

  return (
    <div
      className="grund dialog-grund"
      role="dialog"
      aria-modal="true"
      aria-label={`${i + 1} / ${fotos.length}`}
      onClick={aufSchliessen}
      onTouchStart={(e) => (beruehrt.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (beruehrt.current == null) return;
        const weg = e.changedTouches[0].clientX - beruehrt.current;
        if (weg < -50) weiter();
        if (weg > 50) zurueck();
        beruehrt.current = null;
      }}
    >
      <button type="button" className="zu" onClick={aufSchliessen} aria-label={t.zustand.schliessen}>
        <X size={22} strokeWidth={1.5} aria-hidden />
      </button>

      {i > 0 && (
        <button
          type="button"
          className="pfeil links"
          aria-label={t.fotos.vorheriges}
          onClick={(e) => {
            e.stopPropagation();
            zurueck();
          }}
        >
          <ChevronLeft size={26} strokeWidth={1.5} aria-hidden />
        </button>
      )}

      <div className="bild" onClick={(e) => e.stopPropagation()}>
        <FotoBild key={foto.id} foto={foto} prioritaet />
      </div>

      {i < fotos.length - 1 && (
        <button
          type="button"
          className="pfeil rechts"
          aria-label={t.fotos.naechstes}
          onClick={(e) => {
            e.stopPropagation();
            weiter();
          }}
        >
          <ChevronRight size={26} strokeWidth={1.5} aria-hidden />
        </button>
      )}

      {fotos.length > 1 && (
        <div className="punkte" aria-hidden>
          {fotos.map((f, k) => (
            <span key={f.id} data-aktiv={k === i} />
          ))}
        </div>
      )}

      <style jsx>{`
        .grund {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-24);
          background: rgb(9 8 7 / 0.94);
        }
        .bild {
          max-width: min(100%, 1200px);
          max-height: 88dvh;
          display: flex;
        }
        .bild :global(img) {
          max-height: 88dvh;
          width: auto;
          object-fit: contain;
        }
        .zu,
        .pfeil {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: none;
          border-radius: var(--radius-full);
          background: transparent;
          color: rgb(250 247 242 / 0.8);
          cursor: pointer;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        .zu:hover,
        .pfeil:hover {
          background: rgb(250 247 242 / 0.12);
          color: rgb(250 247 242);
        }
        .zu {
          top: var(--space-16);
          right: var(--space-16);
        }
        .links {
          left: var(--space-8);
        }
        .rechts {
          right: var(--space-8);
        }
        .punkte {
          position: absolute;
          bottom: var(--space-24);
          display: flex;
          gap: var(--space-8);
        }
        .punkte span {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: rgb(250 247 242 / 0.3);
          transition: background var(--motion-feed);
        }
        .punkte span[data-aktiv='true'] {
          background: rgb(250 247 242 / 0.9);
        }
      `}</style>
    </div>
  );
}
