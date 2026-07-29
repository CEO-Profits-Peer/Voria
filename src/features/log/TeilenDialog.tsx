'use client';

/**
 * Teilen — pro Tag, nicht pro Konto.
 *
 * Das ist der Kern des Privatsphäre-Versprechens: Sichtbarkeit ist eine
 * Entscheidung für diesen einen Eintrag. Wer nichts teilt, verliert nichts,
 * und die Voreinstellung bleibt immer privat.
 *
 * Der Dialog nennt beim Namen, was passiert — kein „Öffentlich" als
 * Schalter ohne Erklärung.
 */

import { useState, useTransition } from 'react';
import { Lock, Users, Globe, X } from 'lucide-react';
import { Knopf } from '@/ui/Knopf';
import { useT } from '@/i18n/Sprachraum';
import { sichtbarkeitSetzen } from './actions';

type Stufe = 'private' | 'followers' | 'public';



export function TeilenDialog({
  eintragId,
  jetzt,
  aufSchliessen,
}: {
  eintragId: string;
  jetzt: Stufe;
  aufSchliessen: () => void;
}) {
  const { t } = useT();
  const [stufe, setStufe] = useState<Stufe>(jetzt);

  const stufen = [
    { wert: 'private' as Stufe, Icon: Lock, name: t.teilen.privat, erklaerung: t.teilen.privatErklaerung },
    { wert: 'followers' as Stufe, Icon: Users, name: t.teilen.folgende, erklaerung: t.teilen.folgendeErklaerung },
    { wert: 'public' as Stufe, Icon: Globe, name: t.teilen.oeffentlich, erklaerung: t.teilen.oeffentlichErklaerung },
  ];
  const [text, setText] = useState('');
  const [laeuft, starten] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);

  /*
   * Der Dialog schloss sich früher immer — auch wenn das Veröffentlichen
   * fehlschlug. Der Tag sah danach geteilt aus, im Feed stand aber
   * nichts, und niemand konnte sehen warum. Jetzt bleibt der Dialog im
   * Fehlerfall offen und sagt, was los ist.
   */
  const sichern = () =>
    starten(async () => {
      setFehler(null);
      const ergebnis = await sichtbarkeitSetzen(eintragId, stufe, stufe === 'public' ? text : '');
      if (ergebnis?.fehler) {
        setFehler(ergebnis.fehler);
        return;
      }
      aufSchliessen();
    });

  return (
    <div className="grund dialog-grund" onClick={aufSchliessen}>
      <div className="blatt dialog-blatt" role="dialog" aria-label={t.teilen.teilen} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="zu" onClick={aufSchliessen} aria-label={t.zustand.schliessen}>
          <X size={20} strokeWidth={1.5} aria-hidden />
        </button>

        <h2>{t.teilen.titel}</h2>

        <div className="stufen" role="radiogroup" aria-label={t.teilen.titel}>
          {stufen.map(({ wert, Icon, name, erklaerung }) => (
            <button
              key={wert}
              type="button"
              role="radio"
              aria-checked={stufe === wert}
              data-aktiv={stufe === wert}
              onClick={() => setStufe(wert)}
            >
              <Icon size={20} strokeWidth={1.5} aria-hidden />
              <span className="text">
                <span className="name">{name}</span>
                <span className="erklaerung">{erklaerung}</span>
              </span>
            </button>
          ))}
        </div>

        {stufe === 'public' && (
          <label className="dazu">
            <span>{t.teilen.einSatzDazu}</span>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.teilen.optional}
            />
          </label>
        )}

        {fehler && (
          <p className="teilen-fehler" role="alert">
            {fehler}
          </p>
        )}

        <Knopf art="primaer" groesse="gross" breit onClick={sichern} disabled={laeuft}>
          {laeuft ? t.auth.einenMoment : t.log.uebernehmen}
        </Knopf>
      </div>

      <style jsx>{`
        .teilen-fehler {
          margin: 0;
          padding: var(--space-12) var(--space-16);
          border-left: 2px solid var(--state-danger);
          background: var(--surface-sunken);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-primary);
        }
        .grund {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: var(--surface-scrim);
        }
        .blatt {
          position: relative;
          width: 100%;
          max-width: 440px;
          padding: var(--space-32);
          border-radius: var(--radius-14) var(--radius-14) 0 0;
          background: var(--surface-overlay);
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
          box-shadow: 0 -24px 64px rgb(21 19 17 / 0.18);
        }
        .zu {
          position: absolute;
          top: var(--space-12);
          right: var(--space-12);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--content-muted);
          cursor: pointer;
        }
        h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        .stufen {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .stufen button {
          display: flex;
          align-items: flex-start;
          gap: var(--space-12);
          padding: var(--space-16);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: transparent;
          color: var(--content-muted);
          text-align: left;
          cursor: pointer;
          transition: border-color var(--motion-feed), background var(--motion-feed);
        }
        .stufen button[data-aktiv='true'] {
          border-color: var(--accent-primary);
          background: var(--accent-soft);
          color: var(--content-accent);
        }
        .text {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .name {
          font-family: var(--font-ui);
          font-size: var(--size-16);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .erklaerung {
          font-size: var(--size-14);
          line-height: var(--leading-snug);
          color: var(--content-secondary);
        }
        .dazu {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .dazu span {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        textarea {
          padding: var(--space-12) var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          resize: vertical;
          outline: none;
        }
        textarea:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        @media (min-width: 900px) {
          .grund {
            align-items: center;
          }
          .blatt {
            border-radius: var(--radius-14);
          }
        }
      `}</style>
    </div>
  );
}
