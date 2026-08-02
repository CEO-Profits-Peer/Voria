import { ladeRueckblick } from '@/features/rueckblick/queries';
import { RueckblickAnsicht } from '@/features/rueckblick/RueckblickAnsicht';
import { RueckblickTeilen } from '@/features/rueckblick/RueckblickTeilen';
import { rueckblickToken } from '@/features/rueckblick/teilenActions';
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

  const jahrZahl = gueltig ? zahl : new Date().getFullYear();

  const [daten, { t }, token] = await Promise.all([
    ladeRueckblick(jahrZahl),
    texte(),
    rueckblickToken(jahrZahl),
  ]);

  if (daten.tage === 0) {
    return <LeererBereich titel={t.rueckblick.keinJahr} zeile={t.rueckblick.keinJahrZeile} />;
  }

  return (
    <div className="seite">
      <Seitenkopf titel={t.rueckblick.titel} zeile={t.rueckblick.zeile} />
      <RueckblickAnsicht daten={daten} />

      {/*
        Der Rückblick ist laut Gesamtbeschreibung „der geplante
        Anstoß" — etwas, das man herzeigen will. Ohne einen Weg nach
        draußen war er das nicht.

        Geteilt werden ausschließlich Zahlen und Länder; was der
        Rückblick oben an Titeln und Orten zeigt, bleibt drinnen.
        Begründung in features/rueckblick/teilenActions.ts.
      */}
      <RueckblickTeilen jahr={daten.jahr} token={token} />
    </div>
  );
}
