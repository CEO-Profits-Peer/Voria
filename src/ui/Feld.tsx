/**
 * Eingabefeld und mehrzeiliges Textfeld.
 *
 * Das Eingabefeld ist Bedienung — Sans-Serif, 40 px hoch, ruhiger
 * Fokusring. Das mehrzeilige Textfeld ist Inhalt, wenn darin ein
 * Tagebucheintrag entsteht: dann Serife und 18/1.75, damit Schreiben
 * und Lesen gleich aussehen. Umgeschaltet über `inhalt`.
 *
 * Fehlertexte sind ganze Sätze ohne Ausrufezeichen.
 * Kein Zeichenzähler, keine Wortzahl, kein Speichern-Zwang.
 */

'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FeldProps extends InputHTMLAttributes<HTMLInputElement> {
  beschriftung?: string;
  hilfe?: string;
  fehler?: string;
}

export function Feld({ beschriftung, hilfe, fehler, id, ...rest }: FeldProps) {
  const feldId = id ?? rest.name;
  return (
    <label className="wrap">
      {beschriftung && <span className="beschriftung">{beschriftung}</span>}
      <input id={feldId} data-fehler={Boolean(fehler)} aria-invalid={Boolean(fehler)} {...rest} />
      {(fehler || hilfe) && (
        <span data-fehler={Boolean(fehler)} className="hinweis">
          {fehler ?? hilfe}
        </span>
      )}

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .beschriftung {
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: var(--weight-medium);
          color: var(--content-secondary);
        }
        input {
          height: 40px;
          padding: 0 12px;
          border-radius: 7px;
          border: 1px solid var(--border-default);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          /* 16 px verhindert den iOS-Zoom beim Fokus. */
          font-size: 16px;
          outline: none;
          transition: border-color var(--motion-feed), box-shadow var(--motion-feed);
        }
        @media (min-width: 900px) {
          input {
            font-size: 14px;
          }
        }
        input::placeholder {
          color: var(--content-muted);
        }
        input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        input[data-fehler='true'] {
          border-color: var(--state-danger);
        }
        .hinweis {
          font-family: var(--font-ui);
          font-size: 12px;
          line-height: var(--leading-snug);
          color: var(--content-muted);
        }
        .hinweis[data-fehler='true'] {
          color: var(--state-danger);
        }
      `}</style>
    </label>
  );
}

interface TextfeldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hilfe?: string;
  /** Enthält Tagebuchtext — dann Serife statt Bedienschrift. */
  inhalt?: boolean;
}

export function Textfeld({ hilfe, inhalt = false, ...rest }: TextfeldProps) {
  return (
    <div className="wrap">
      <textarea rows={6} data-inhalt={inhalt} {...rest} />
      {hilfe && <span className="hinweis">{hilfe}</span>}

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--radius-8);
          border: 1px solid var(--border-default);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: 14px;
          line-height: var(--leading-normal);
          outline: none;
          resize: vertical;
          transition: border-color var(--motion-page), box-shadow var(--motion-page);
        }
        textarea[data-inhalt='true'] {
          padding: 18px 20px;
          border-radius: var(--radius-14);
          font-family: var(--font-text);
          font-size: var(--size-18);
          line-height: var(--leading-relaxed);
        }
        textarea:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        textarea::placeholder {
          color: var(--content-muted);
        }
        .hinweis {
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--content-muted);
        }
      `}</style>
    </div>
  );
}
