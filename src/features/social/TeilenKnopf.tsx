'use client';

/**
 * Beitrag nach außen teilen.
 *
 * Zwei Wege, in dieser Reihenfolge:
 *
 *   1. `navigator.share` — auf dem Handy öffnet das das Systemblatt
 *      mit WhatsApp, Signal, Mail und allem, was installiert ist. Das
 *      ist der Weg, den fast alle nehmen werden.
 *   2. Adresse in die Zwischenablage. Auf dem Desktop gibt es das
 *      Systemblatt meist nicht, und ein selbstgebauter Dialog mit
 *      zwanzig Netzwerk-Symbolen wäre genau die Sorte Ballast, die
 *      Voria nicht haben soll.
 *
 * Geteilt wird `/b/<id>`, nicht `/feed/<id>`: die Feed-Route verlangt
 * eine Anmeldung, ein Link darauf wäre für Fremde eine Sackgasse.
 *
 * `navigator.share` MUSS aus einer echten Nutzergeste heraufgerufen
 * werden. Deshalb wird die Adresse vorher synchron gebaut und nicht
 * erst nach einem `await` — sonst gilt die Geste als verbraucht und
 * der Browser lehnt ab.
 */

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useT } from '@/i18n/Sprachraum';

export function TeilenKnopf({
  beitragId,
  titel,
  verfasser,
}: {
  beitragId: string;
  titel: string;
  verfasser: string;
}) {
  const { t } = useT();
  const [kopiert, setKopiert] = useState(false);

  const teilen = async () => {
    // window.location, damit auch Vorschau-Deployments die richtige
    // Adresse bilden — dort ist die Domain bei jedem Push anders.
    const adresse = `${window.location.origin}/b/${beitragId}`;
    const text = `${titel} — von ${verfasser} auf Voria`;

    if (navigator.share) {
      try {
        await navigator.share({ title: titel, text, url: adresse });
        return;
      } catch (e) {
        /*
         * Bricht der Nutzer das Systemblatt ab, wirft `share` einen
         * AbortError. Das ist kein Fehler und darf nicht in den
         * Kopieren-Weg fallen — sonst landet die Adresse in der
         * Zwischenablage, obwohl man gerade abgebrochen hat.
         */
        if (e instanceof Error && e.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${adresse}`);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Zwischenablage verweigert (kein HTTPS, alte Einstellung):
      // dann bleibt der Knopf stumm, statt eine Fehlermeldung zu
      // zeigen, die niemandem hilft.
    }
  };

  return (
    <button type="button" className="teilen-knopf" onClick={teilen} aria-live="polite">
      {kopiert ? (
        <>
          <Check size={17} strokeWidth={2} aria-hidden />
          {t.feed.kopiert}
        </>
      ) : (
        <>
          <Share2 size={17} strokeWidth={1.75} aria-hidden />
          {t.feed.teilen}
        </>
      )}

      <style jsx>{`
        .teilen-knopf {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          /* Gleiche Höhe und Form wie der Stimmen-Knopf daneben,
             sonst sitzen die beiden schief zueinander. */
          min-height: 44px;
          padding: 0 var(--space-12);
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        .teilen-knopf:hover {
          background: var(--surface-sunken);
          color: var(--content-primary);
        }
      `}</style>
    </button>
  );
}
