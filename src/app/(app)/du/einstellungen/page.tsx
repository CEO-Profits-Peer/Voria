import Link from 'next/link';
import { ChevronLeft, Palette, Bell, Gem, UserRound } from 'lucide-react';
import { Kategorien } from '@/ui/Kategorien';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Einstellungen · Voria' };

/**
 * Vier Kategorien statt sieben Abschnitten in einem langen Scroll.
 *
 * Die Reihenfolge folgt dem, wonach jemand tatsächlich sucht:
 * Aussehen zuerst (das wollen die meisten), Hinweise als Zweites
 * (das will man abstellen), PRO danach, Konto zuletzt — dort liegt
 * das Löschen, und dorthin soll niemand versehentlich stolpern.
 */
export default async function EinstellungenSeite() {
  const { t } = await texte();

  return (
    <div className="seite">
      <Link href="/du" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.profil.du}
      </Link>
      <h1 className="gross">{t.einstellungen.titel}</h1>

      <Kategorien
        eintraege={[
          {
            href: '/du/einstellungen/aussehen',
            titel: t.einstellungen.katAussehen,
            zeile: t.einstellungen.katAussehenZeile,
            Icon: Palette,
          },
          {
            href: '/du/einstellungen/hinweise',
            titel: t.einstellungen.katHinweise,
            zeile: t.einstellungen.katHinweiseZeile,
            Icon: Bell,
          },
          {
            href: '/du/einstellungen/pro',
            titel: t.pro.titel,
            zeile: t.einstellungen.katProZeile,
            Icon: Gem,
          },
          {
            href: '/du/einstellungen/konto',
            titel: t.konto.titel,
            zeile: t.einstellungen.katKontoZeile,
            Icon: UserRound,
          },
        ]}
      />
    </div>
  );
}
