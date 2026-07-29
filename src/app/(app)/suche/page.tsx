import { Suche } from '@/features/suche/Suche';
import { Seitenkopf } from '@/ui/Bausteine';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Suchen · Voria' };

export default async function SucheSeite() {
  const { t } = await texte();
  return (
    <div className="seite">
      <Seitenkopf titel={t.suche.titel} zeile={t.suche.zeile} />
      <Suche />
    </div>
  );
}
