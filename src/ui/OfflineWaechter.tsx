'use client';

/**
 * Meldet den Service Worker an und zeigt an, wenn das Netz weg ist.
 *
 * Der Hinweis ist bewusst beruhigend statt alarmierend — offline zu sein
 * ist auf einer Reise der Normalfall, kein Fehler. Deshalb steht dort,
 * was weiter funktioniert, und nicht, was kaputt ist.
 */

import { useEffect, useState } from 'react';
import { CloudOff } from 'lucide-react';
import { useT } from '@/i18n/Sprachraum';

export function OfflineWaechter() {
  const { t } = useT();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* Ohne Service Worker läuft alles weiter, nur eben nicht offline. */
      });
    }

    const an = () => setOffline(false);
    const aus = () => setOffline(true);
    setOffline(!navigator.onLine);

    window.addEventListener('online', an);
    window.addEventListener('offline', aus);
    return () => {
      window.removeEventListener('online', an);
      window.removeEventListener('offline', aus);
    };
  }, []);

  if (!offline) return null;

  return (
    <div role="status" className="streifen">
      <CloudOff size={16} strokeWidth={1.5} aria-hidden />
      <span>{t.zustand.offlineStreifen}</span>

      <style jsx>{`
        .streifen {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-8);
          padding: var(--space-8) var(--space-16);
          background: var(--surface-sunken);
          border-bottom: 1px solid var(--border-subtle);
          color: var(--content-secondary);
          font-size: var(--size-14);
          line-height: var(--leading-snug);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
