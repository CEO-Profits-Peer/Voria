import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Einstellungen } from '@/features/profile/Einstellungen';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Einstellungen · Voria' };

export default async function EinstellungenSeite() {
  const { t } = await texte();
  return (
    <div className="seite">
      <Link href="/du" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.profil.du}
      </Link>
      <h1 className="gross">{t.einstellungen.titel}</h1>
      <Einstellungen />
    </div>
  );
}
