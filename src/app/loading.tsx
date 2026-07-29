import { texte } from '@/i18n/server';

/** Ruhiger Ladezustand. Kein Spinner, kein Balken — nur eine Zeile. */
export default async function Laden() {
  const { t } = await texte();
  return (
    <div className="mittig" aria-busy="true">
      <p className="laden-zeile">{t.zustand.laden}</p>
    </div>
  );
}
