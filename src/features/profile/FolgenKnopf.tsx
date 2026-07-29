'use client';

import { useOptimistic, useTransition } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { folgen } from '@/features/social/actions';
import { useT } from '@/i18n/Sprachraum';

export function FolgenKnopf({ profilId, folgtBereits }: { profilId: string; folgtBereits: boolean }) {
  const { t } = useT();
  const [folgt, umschalten] = useOptimistic(folgtBereits, (v) => !v);
  const [, starten] = useTransition();

  return (
    <button
      type="button"
      data-folgt={folgt}
      aria-pressed={folgt}
      onClick={() =>
        starten(() => {
          umschalten(null);
          folgen(profilId, folgt);
        })
      }
    >
      {folgt ? (
        <>
          <UserCheck size={18} strokeWidth={1.5} aria-hidden /> {t.profil.duFolgstIhm}
        </>
      ) : (
        <>
          <UserPlus size={18} strokeWidth={1.5} aria-hidden /> {t.profil.folgenAktion}
        </>
      )}

      <style jsx>{`
        button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          height: 44px;
          padding: 0 var(--space-20);
          border-radius: var(--radius-8);
          border: 1px solid var(--accent-primary);
          background: var(--accent-primary);
          color: var(--accent-contrast);
          font-family: var(--font-ui);
          font-size: var(--size-16);
          font-weight: var(--weight-medium);
          cursor: pointer;
          white-space: nowrap;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        button[data-folgt='true'] {
          background: transparent;
          border-color: var(--border-default);
          color: var(--content-secondary);
        }
        button[data-folgt='true']:hover {
          border-color: var(--border-strong);
          color: var(--content-primary);
        }
      `}</style>
    </button>
  );
}
