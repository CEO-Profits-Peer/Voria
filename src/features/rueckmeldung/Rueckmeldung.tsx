'use client';

/**
 * Das Rückmeldeformular.
 *
 * Ein Feld, ein Knopf, kein Betreff und keine Kategorienauswahl. Wer
 * etwas melden will, soll schreiben können, nicht erst einordnen —
 * das Einordnen ist Arbeit des Betreibers, nicht des Nutzers.
 *
 * Hier gibt es ausnahmsweise einen Absendeknopf. Der Rest von Voria
 * speichert von selbst, weil dort das eigene Tagebuch entsteht. Eine
 * Nachricht an jemand anderen darf nicht verschickt werden, solange
 * man noch tippt.
 */

import { useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { rueckmeldungSenden } from './actions';
import { useT } from '@/i18n/Sprachraum';

export function Rueckmeldung() {
  const { t } = useT();
  const pfad = usePathname();
  const [text, setText] = useState('');
  const [fehler, setFehler] = useState<string | null>(null);
  const [gesendet, setGesendet] = useState(false);
  const [laeuft, starten] = useTransition();

  const senden = () =>
    starten(async () => {
      setFehler(null);
      const ergebnis = await rueckmeldungSenden(text, pfad);

      if (ergebnis.ok) {
        setGesendet(true);
        setText('');
        return;
      }
      setFehler(
        ergebnis.grund === 'leer'
          ? t.rueckmeldung.zuKurz
          : ergebnis.grund === 'lang'
            ? t.rueckmeldung.zuLang
            : t.rueckmeldung.schiefgelaufen,
      );
    });

  if (gesendet) {
    return (
      <p className="danke" role="status">
        <Check size={18} strokeWidth={1.5} aria-hidden />
        {t.rueckmeldung.danke}
        <style jsx>{`
          .danke {
            display: flex;
            align-items: center;
            gap: var(--space-8);
            margin: 0;
            padding: var(--space-20);
            border-radius: var(--radius-8);
            background: var(--accent-soft);
            color: var(--content-accent);
            font-family: var(--font-ui);
            font-size: var(--size-14);
          }
        `}</style>
      </p>
    );
  }

  return (
    <div className="wrap">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.rueckmeldung.platzhalter}
        aria-label={t.rueckmeldung.titel}
        rows={7}
      />

      {fehler && (
        <p className="fehler" role="alert">
          {fehler}
        </p>
      )}

      <div className="fuss">
        <button type="button" onClick={senden} disabled={laeuft || text.trim().length < 3}>
          {laeuft ? t.rueckmeldung.laeuft : t.rueckmeldung.senden}
        </button>
        <span className="hinweis">{t.rueckmeldung.hinweis}</span>
      </div>

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        textarea {
          width: 100%;
          padding: var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-primary);
          /* Gelesen wird das hier nicht, geschrieben schon — trotzdem
             Bedienschrift: es ist eine Nachricht, kein Tagebuchtext. */
          font-family: var(--font-ui);
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          resize: vertical;
        }
        textarea:focus {
          outline: none;
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .fehler {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--content-accent);
        }
        .fuss {
          display: flex;
          align-items: center;
          gap: var(--space-16);
          flex-wrap: wrap;
        }
        button {
          height: 40px;
          padding: 0 var(--space-24);
          border: none;
          border-radius: 7px;
          background: var(--accent-primary);
          color: var(--surface-canvas);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-semi);
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .hinweis {
          flex: 1;
          min-width: 220px;
          font-family: var(--font-ui);
          font-size: 12px;
          line-height: var(--leading-normal);
          color: var(--content-muted);
        }
      `}</style>
    </div>
  );
}
