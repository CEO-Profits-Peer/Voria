import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Erscheinungsbild } from '@/features/profile/Erscheinungsbild';
import { RegionenVorschau } from '@/features/profile/RegionenVorschau';
import { SprachWahl } from '@/features/profile/SprachWahl';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Aussehen · Voria' };

export default async function AussehenSeite() {
  const { t } = await texte();

  return (
    <div className="seite">
      <Link href="/du/einstellungen" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.einstellungen.titel}
      </Link>
      <h1 className="gross">{t.einstellungen.katAussehen}</h1>

      <div className="abschnitte">
        <section>
          <h2>{t.einstellungen.erscheinungsbild}</h2>
          <Erscheinungsbild />
        </section>

        <SprachWahl />

        {/* Zuletzt, weil es das lange Schaufenster ist — was man
            einstellen WILL, soll nicht dahinter liegen. */}
        <section>
          <h2>{t.einstellungen.zwoelfWelten}</h2>
          <RegionenVorschau />
        </section>
      </div>
    </div>
  );
}
