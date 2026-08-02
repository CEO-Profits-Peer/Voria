'use client';

/**
 * Den Jahresrückblick teilen — und zurückziehen.
 *
 * Der Satz darunter nennt ausdrücklich, was NICHT mitgeht: keine
 * Titel, keine Orte, keine Texte, keine Fotos. Das ist kein
 * Kleingedrucktes, sondern der Grund, warum man den Link überhaupt
 * guten Gewissens weitergeben kann — und es steht deshalb an der
 * Stelle, an der man sich entscheidet.
 */

import { useState, useTransition } from 'react';
import { Share2, Check, X } from 'lucide-react';
import { rueckblickTeilen, rueckblickZurueckziehen } from './teilenActions';
import { useT } from '@/i18n/Sprachraum';

export function RueckblickTeilen({ jahr, token }: { jahr: number; token: string | null }) {
  const { t } = useT();
  const [jetzt, setJetzt] = useState(token);
  const [kopiert, setKopiert] = useState(false);
  const [laeuft, starten] = useTransition();

  const adresse = jetzt ? `${typeof window === 'undefined' ? '' : window.location.origin}/r/${jetzt}` : '';

  const teilen = () =>
    starten(async () => {
      const neu = await rueckblickTeilen(jahr);
      if (!neu) return;
      setJetzt(neu);

      const url = `${window.location.origin}/r/${neu}`;
      /* Das Systemblatt am Handy, die Zwischenablage am Rechner —
         dieselbe Aufteilung wie beim Teilen eines Beitrags. */
      if (navigator.share) {
        try {
          await navigator.share({ title: `${jahr} · ${t.marke}`, url });
          return;
        } catch {
          /* Abgebrochen ist kein Fehler. */
        }
      }
      await navigator.clipboard?.writeText(url).catch(() => {});
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    });

  const zurueck = () =>
    starten(async () => {
      await rueckblickZurueckziehen(jahr);
      setJetzt(null);
    });

  return (
    <div className="rb-teilen">
      <p className="rb-teilen-zeile">{t.rueckblick.teilenZeile}</p>

      <div className="rb-teilen-knoepfe">
        <button type="button" className="anlegen" onClick={teilen} disabled={laeuft}>
          {kopiert ? (
            <Check size={16} strokeWidth={1.75} aria-hidden />
          ) : (
            <Share2 size={16} strokeWidth={1.75} aria-hidden />
          )}
          {kopiert ? t.rueckblick.linkKopiert : t.rueckblick.teilen}
        </button>

        {jetzt && (
          <button type="button" className="rb-weg" onClick={zurueck} disabled={laeuft}>
            <X size={15} strokeWidth={1.75} aria-hidden />
            {t.rueckblick.zurueckziehen}
          </button>
        )}
      </div>

      {jetzt && (
        <p className="rb-teilen-stand">
          {t.rueckblick.geteiltSeit} <span className="rb-adresse">{adresse}</span>
        </p>
      )}

      <style jsx>{`
        .rb-teilen {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
          max-width: 60ch;
          margin-top: var(--space-32);
          padding: var(--space-20);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
        }
        .rb-teilen-zeile,
        .rb-teilen-stand {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
        }
        .rb-teilen-stand {
          font-size: 12px;
          color: var(--content-muted);
        }
        .rb-adresse {
          /* Eine Adresse bricht an jeder Stelle, sonst sprengt sie
             den Kasten am Handy. */
          word-break: break-all;
        }
        .rb-teilen-knoepfe {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        .rb-teilen-knoepfe button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 44px;
          cursor: pointer;
        }
        .rb-weg {
          padding: 0 var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: 7px;
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: 13px;
        }
        .rb-weg:hover {
          border-color: var(--border-strong);
          color: var(--content-primary);
        }
      `}</style>
    </div>
  );
}
