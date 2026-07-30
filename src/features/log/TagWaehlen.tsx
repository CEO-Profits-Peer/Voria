'use client';

/**
 * Einen vergangenen Tag anlegen.
 *
 * Die Route /log/[reiseId]/[datum] kann das längst — es fehlte nur der
 * Weg dorthin. Auf der Reiseseite stand ausschließlich „Heute
 * schreiben", und wer abends drei Tage nachtragen wollte, kam nicht
 * hin.
 *
 * Bewusst das native Datumsfeld: am Handy öffnet es den Systemwähler,
 * den jeder kennt, und es kostet kein Kilobyte. Ein eigener Kalender
 * wäre hier Selbstzweck.
 *
 * Grenzen kommen aus der Reise. Ein Tag außerhalb ist in der Datenbank
 * erlaubt, aber fast immer ein Vertipper.
 */

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus } from 'lucide-react';
import { useT } from '@/i18n/Sprachraum';

export function TagWaehlen({
  reiseId,
  von,
  bis,
}: {
  reiseId: string;
  von: string | null;
  bis: string | null;
}) {
  const { t } = useT();
  const router = useRouter();
  const feld = useRef<HTMLInputElement>(null);
  const [offen, setOffen] = useState(false);

  function oeffnen() {
    setOffen(true);
    /*
     * Erst nach dem Rendern greifbar. showPicker() gibt es nicht
     * überall — ohne die Prüfung wirft Firefox hier, und dann bliebe
     * das Feld zwar sichtbar, aber der Fokus läge nirgends.
     */
    requestAnimationFrame(() => {
      feld.current?.focus();
      try {
        feld.current?.showPicker?.();
      } catch {
        /* Kein Systemwähler — das sichtbare Feld tut es auch. */
      }
    });
  }

  return (
    <div className="waehler">
      {offen ? (
        <input
          ref={feld}
          type="date"
          min={von ?? undefined}
          max={bis ?? undefined}
          aria-label={t.log.andererTagLabel}
          onChange={(e) => {
            if (e.target.value) router.push(`/log/${reiseId}/${e.target.value}`);
          }}
          onBlur={(e) => {
            if (!e.target.value) setOffen(false);
          }}
        />
      ) : (
        <button type="button" onClick={oeffnen}>
          <CalendarPlus size={16} strokeWidth={1.5} aria-hidden />
          {t.log.andererTag}
        </button>
      )}

      <style jsx>{`
        .waehler {
          display: flex;
          min-height: 52px;
          align-items: center;
        }
        button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          /* Berührungsziel bleibt 44 px, auch wenn die Schrift klein ist. */
          min-height: 44px;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: color var(--motion-feed);
        }
        button:hover {
          color: var(--accent-primary);
        }
        input {
          min-height: 44px;
          padding: 0 var(--space-12);
          border: 1px solid var(--border-focus);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: 14px;
        }
        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
      `}</style>
    </div>
  );
}
