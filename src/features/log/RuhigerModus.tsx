'use client';

/**
 * Ein Tag als Buchseite.
 *
 * Eine Textspalte, Fotos als ruhige Blöcke im Fluss. Kein Zeichenzähler,
 * kein Speichern-Knopf, keine Wortzahl. Der Text wird verzögert gesichert,
 * während man schreibt.
 *
 * Der leere erste Tag ist Variante B: eine einzige leise Frage plus der
 * Foto-Weg. Entschieden am 28.07. — der Cursor allein sagt nur „hier kann
 * getippt werden", nicht was.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import type { Block } from './queries';
import { textSpeichern, titelSpeichern } from './actions';
import { FotoBild } from './FotoBild';
import { useT } from '@/i18n/Sprachraum';



export function RuhigerModus({
  eintragId,
  datum,
  ort,
  titel: titelStart,
  bloecke,
  istErsterTag,
  aufFotoWaehlen,
  aufFotoOeffnen,
}: {
  eintragId: string;
  datum: string;
  ort: string | null;
  titel: string | null;
  bloecke: Block[];
  istErsterTag: boolean;
  aufFotoWaehlen: () => void;
  aufFotoOeffnen: (index: number) => void;
}) {
  const { t, locale } = useT();
  const textBloecke = bloecke.filter((b) => b.art === 'text');
  const [titel, setTitel] = useState(titelStart ?? '');
  const [text, setText] = useState(textBloecke.map((b) => b.text ?? '').join('\n\n'));
  const blockId = useRef<string | null>(textBloecke[0]?.id ?? null);
  const feld = useRef<HTMLTextAreaElement>(null);
  const istLeer = bloecke.length === 0 && text.trim() === '';

  // Verzögertes Sichern. Kein Knopf, keine Rückmeldung — es passiert einfach.
  useEffect(() => {
    if (text === textBloecke.map((b) => b.text ?? '').join('\n\n')) return;
    const uhr = setTimeout(async () => {
      const id = await textSpeichern(eintragId, blockId.current, text);
      if (id) blockId.current = id;
    }, 900);
    return () => clearTimeout(uhr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, eintragId]);

  useEffect(() => {
    if (titel === (titelStart ?? '')) return;
    const uhr = setTimeout(() => titelSpeichern(eintragId, titel), 900);
    return () => clearTimeout(uhr);
  }, [titel, titelStart, eintragId]);

  // Mitwachsen ohne `field-sizing`, das noch nicht überall unterstützt wird.
  useLayoutEffect(() => {
    const el = feld.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const anstoss = t.log.anstoss[new Date(datum).getDate() % t.log.anstoss.length];

  return (
    <article className="blatt">
      <div className="kopf">
        <div className="datum">
          {formatiereDatum(datum, locale)}
          {ort && <> · {ort}</>}
        </div>
        <input
          className="titel"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder=""
          aria-label={t.log.titelDesTages}
        />
      </div>

      <textarea
        ref={feld}
        className="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={istLeer && istErsterTag ? anstoss : ''}
        aria-label={t.log.wasHeutePassiertIst}
        rows={6}
      />

      {/* Fotos im Textfluss. Erstes groß, danach abwechselnd. */}
      {bloecke
        .filter((b) => b.art === 'photo' && b.foto)
        .map((b, i) => (
          <figure key={b.id} data-schmal={i % 2 === 1}>
            <button type="button" onClick={() => aufFotoOeffnen(i)} aria-label={t.log.fotoGross}>
              <FotoBild foto={b.foto!} prioritaet={i === 0} />
            </button>
          </figure>
        ))}

      {/*
        Der Hinweis auf Fotos bleibt — aber nur solange der Tag leer
        ist, als sanfter Anstoß. Der eigentliche Weg zum Foto liegt
        jetzt in TagLeiste.tsx und ist immer erreichbar, in beiden Modi.
      */}
      {istLeer && (
        <button type="button" className="fotoweg" onClick={aufFotoWaehlen}>
          <ImagePlus size={20} strokeWidth={1.5} aria-hidden />
          <span>{t.log.fotoWeg}</span>
        </button>
      )}


      <style jsx>{`
        .blatt {
          max-width: 68ch;
          margin: 0 auto;
          padding: var(--space-24) var(--space-24) var(--space-64);
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
        .kopf {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .datum {
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .titel {
          border: none;
          background: transparent;
          padding: 0;
          font-family: var(--font-display);
          font-size: var(--size-30);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
          outline: none;
        }
        /* Kein Platzhalter, wenn kein Titel da ist — die Zeile verschwindet. */
        .titel::placeholder {
          color: transparent;
        }
        .text {
          border: none;
          background: transparent;
          padding: 0;
          resize: none;
          outline: none;
          font-family: var(--font-text);
          font-size: var(--size-18);
          line-height: var(--leading-relaxed);
          color: var(--content-primary);
          overflow: hidden;
          min-height: 9lh;
        }
        .text::placeholder {
          color: var(--content-muted);
          font-style: italic;
        }
        figure {
          margin: var(--space-4) 0;
          border-radius: var(--radius-8);
          overflow: hidden;
        }
        figure[data-schmal='true'] {
          max-width: 62%;
        }
        figure button {
          display: block;
          width: 100%;
          padding: 0;
          border: none;
          background: none;
          cursor: zoom-in;
        }
        .fotoweg {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          min-height: 44px;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-text);
          font-size: var(--size-16);
          cursor: pointer;
          transition: color var(--motion-feed);
        }
        .fotoweg:hover {
          color: var(--accent-primary);
        }
      `}</style>
    </article>
  );
}

function formatiereDatum(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
