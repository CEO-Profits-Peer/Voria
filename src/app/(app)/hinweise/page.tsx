import { ladeHinweise } from '@/features/hinweise/queries';
import { AlsGelesen } from '@/features/hinweise/AlsGelesen';
import { HinweisListe } from '@/features/hinweise/HinweisListe';
import { LeererBereich } from '@/ui/LeererBereich';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Hinweise · Voria' };

export default async function HinweiseSeite() {
  const [hinweise, { t }] = await Promise.all([ladeHinweise(), texte()]);

  if (hinweise.length === 0) {
    return <LeererBereich titel={t.hinweise.nochNichts} zeile={t.hinweise.nochNichtsZeile} />;
  }

  /*
   * Abgehakt wird erst NACH dem Rendern, durch `AlsGelesen`. Die
   * Liste zeigt deshalb weiter, welche Zeilen neu waren — würde hier
   * schon markiert, wären beim Anzeigen alle gelesen und man sähe
   * nie, was einen erwartet hat.
   */
  return (
    <div className="seite">
      <Seitenkopf titel={t.hinweise.titel} zeile={t.hinweise.zeile} />
      <HinweisListe hinweise={hinweise} />
      <AlsGelesen />
    </div>
  );
}
