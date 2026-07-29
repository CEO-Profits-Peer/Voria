import { ladeWelt } from '@/features/karte/queries';
import { WeltRaster } from '@/features/karte/WeltRaster';
import { LeererBereich } from '@/ui/LeererBereich';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Karte · Voria' };

export default async function KarteSeite() {
  const [welt, { t, locale }] = await Promise.all([ladeWelt(), texte()]);

  if (welt.reisenGesamt === 0) {
    return <LeererBereich titel={t.karte.deineWelt} zeile={t.karte.leerZeile} />;
  }

  const laender = `${welt.laenderGesamt} ${welt.laenderGesamt === 1 ? t.log.land : t.log.laender}`;
  const tage = `${welt.tageGesamt} ${welt.tageGesamt === 1 ? t.log.tag : t.log.tage}`;
  const seit = welt.ersteReise
    ? ` — ${t.karte.seit} ${new Date(welt.ersteReise).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      })}`
    : '';

  return (
    <div className="seite">
      <Seitenkopf titel={t.karte.deineWelt} zeile={`${laender}, ${tage}${seit}.`} />
      <WeltRaster regionen={welt.regionen} />
    </div>
  );
}
