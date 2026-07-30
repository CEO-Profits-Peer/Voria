import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Rueckmeldung } from '@/features/rueckmeldung/Rueckmeldung';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Rückmeldung · Voria' };

export default async function RueckmeldungSeite() {
  const { t } = await texte();

  return (
    <div className="seite">
      <Link href="/du" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.profil.du}
      </Link>
      <Seitenkopf titel={t.rueckmeldung.titel} zeile={t.rueckmeldung.zeile} />
      <Rueckmeldung />
    </div>
  );
}
