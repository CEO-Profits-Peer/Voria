import { ladeRueckblick } from '@/features/rueckblick/queries';
import { RueckblickAnsicht } from '@/features/rueckblick/RueckblickAnsicht';
import { LeererBereich } from '@/ui/LeererBereich';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Rückblick · Voria' };

export default async function RueckblickSeite({
  params,
}: {
  params: Promise<{ jahr: string }>;
}) {
  const { jahr } = await params;
  const zahl = Number(jahr);
  const gueltig = Number.isInteger(zahl) && zahl > 1900 && zahl < 2200;

  const [daten, { t }] = await Promise.all([
    ladeRueckblick(gueltig ? zahl : new Date().getFullYear()),
    texte(),
  ]);

  if (daten.tage === 0) {
    return <LeererBereich titel={t.rueckblick.keinJahr} zeile={t.rueckblick.keinJahrZeile} />;
  }

  return (
    <div className="seite">
      <Seitenkopf titel={t.rueckblick.titel} zeile={t.rueckblick.zeile} />
      <RueckblickAnsicht daten={daten} />
    </div>
  );
}
