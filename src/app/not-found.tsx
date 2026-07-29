import Link from 'next/link';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Nicht gefunden · Voria' };

export default async function NichtGefunden() {
  const { t } = await texte();
  return (
    <div className="mittig">
      <h1>{t.zustand.nichtGefunden}</h1>
      <p>{t.zustand.nichtGefundenZeile}</p>
      <Link href="/log">{t.zustand.zurueckInDenLog}</Link>
    </div>
  );
}
