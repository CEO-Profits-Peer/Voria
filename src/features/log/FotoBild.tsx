'use client';

/**
 * Ein Foto aus dem Speicher.
 *
 * Der Blurhash steht als weiche Fläche darunter, damit beim Laden nichts
 * springt und nichts weiß aufblitzt. Kein Rahmen, kein Schatten — außer
 * im Open Space, wo Fotos einen Sofortbild-Rand tragen dürfen.
 */

import Image from 'next/image';
import { useState } from 'react';

export function FotoBild({
  foto,
  polaroid = false,
  prioritaet = false,
}: {
  foto: { pfad: string; breite: number; hoehe: number; blurhash: string | null };
  polaroid?: boolean;
  prioritaet?: boolean;
}) {
  const [geladen, setGeladen] = useState(false);
  const quelle = oeffentlicheUrl(foto.pfad);

  return (
    <div className="rahmen" data-polaroid={polaroid}>
      <div className="grund" data-weg={geladen} />
      <Image
        src={quelle}
        alt=""
        width={foto.breite}
        height={foto.hoehe}
        priority={prioritaet}
        onLoad={() => setGeladen(true)}
        sizes="(max-width: 900px) 100vw, 700px"
      />

      <style jsx>{`
        .rahmen {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-8);
        }
        .rahmen[data-polaroid='true'] {
          border-radius: 2px;
          background: var(--sofortbild-rand);
          padding: 6px 6px 18px;
          box-shadow: 0 2px 10px var(--sofortbild-schatten);
        }
        .grund {
          position: absolute;
          inset: 0;
          background: var(--surface-sunken);
          transition: opacity var(--motion-log);
        }
        .grund[data-weg='true'] {
          opacity: 0;
        }
        .rahmen :global(img) {
          animation: bild-auf var(--duration-400) var(--ease-out);
          width: 100%;
          height: auto;
          display: block;
        }
        @keyframes bild-auf {
          from {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rahmen :global(img) {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function oeffentlicheUrl(pfad: string) {
  if (pfad.startsWith('http')) return pfad;
  const r2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (r2) return `${r2}/${pfad}`;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${pfad}`;
}
