'use client';

/**
 * Ein Feld zum Schreiben eines Kommentars — für neue, für Antworten
 * und fürs Bearbeiten dasselbe.
 *
 * HIER GIBT ES AUSNAHMSWEISE EINEN KNOPF. Voria kennt sonst kein
 * Speichern: der Tagebuchtext gehört dem Schreiber und darf jederzeit
 * halbfertig liegen bleiben. Ein Kommentar geht an andere Leute — er
 * braucht einen Moment, in dem man sich entscheidet. Verzögertes
 * Sichern würde hier halbe Sätze veröffentlichen.
 *
 * Kein Zeichenzähler. Die Grenze liegt bei 2000 Zeichen und wird
 * serverseitig abgeschnitten; wer sie erreicht, schreibt keinen
 * Kommentar mehr, sondern einen Aufsatz.
 */

import { useState, useTransition } from 'react';
import { useT } from '@/i18n/Sprachraum';

export function Schreibfeld({
  platzhalter,
  knopf,
  anfangswert = '',
  beimAbsenden,
  beimAbbrechen,
}: {
  platzhalter: string;
  knopf: string;
  anfangswert?: string;
  beimAbsenden: (text: string) => Promise<void>;
  beimAbbrechen?: () => void;
}) {
  const { t } = useT();
  const [text, setText] = useState(anfangswert);
  const [laeuft, starten] = useTransition();

  const absenden = () => {
    const sauber = text.trim();
    if (!sauber || laeuft) return;
    starten(async () => {
      await beimAbsenden(sauber);
      setText('');
    });
  };

  return (
    <div className="feld">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={platzhalter}
        rows={text.length > 80 ? 3 : 1}
        onKeyDown={(e) => {
          /* Strg/Cmd+Enter schickt ab. Enter allein macht einen
             Absatz — sonst verliert man einen Gedanken mitten im Satz. */
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            absenden();
          }
          if (e.key === 'Escape' && beimAbbrechen) beimAbbrechen();
        }}
      />
      <div className="tat">
        {beimAbbrechen && (
          <button type="button" className="still-knopf" onClick={beimAbbrechen}>
            {t.kommentar.abbrechen}
          </button>
        )}
        <button type="button" onClick={absenden} disabled={!text.trim() || laeuft}>
          {knopf}
        </button>
      </div>

      <style jsx>{`
        .feld {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        textarea {
          width: 100%;
          padding: var(--space-12);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          resize: vertical;
        }
        textarea:focus {
          outline: none;
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .tat {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-8);
        }
        .tat button {
          min-height: 34px;
          padding: 0 var(--space-16);
          border: 1px solid var(--accent-primary);
          border-radius: 7px;
          background: var(--accent-primary);
          color: var(--accent-contrast);
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: opacity var(--motion-feed);
        }
        .tat button:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .tat .still-knopf {
          border-color: transparent;
          background: transparent;
          color: var(--content-muted);
        }
      `}</style>
    </div>
  );
}
