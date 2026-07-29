import Link from 'next/link';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Offline · Voria' };

/** Zielseite des Service Workers, wenn eine Seite nicht im Speicher liegt. */
export default async function OfflineSeite() {
  const { t } = await texte();
  return (
    <div className="mittig">
      <h1>{t.zustand.keinNetz}</h1>
      <p>{t.zustand.keinNetzZeile}</p>
      <Link href="/log">{t.zustand.zumLog}</Link>
    </div>
  );
}
