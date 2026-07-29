'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useT } from '@/i18n/Sprachraum';

export default function Fehler({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mittig">
      <h1>{t.zustand.fehler}</h1>
      <p>{t.zustand.fehlerZeile}</p>
      <div className="mittig-knoepfe">
        <button type="button" onClick={reset}>{t.zustand.nochEinmal}</button>
        <Link href="/log">{t.zustand.zumLog}</Link>
      </div>
    </div>
  );
}
