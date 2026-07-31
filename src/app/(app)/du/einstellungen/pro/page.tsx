import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProWahl } from '@/features/profile/ProWahl';
import { createServerClient } from '@/lib/supabase-server';
import { istPro } from '@/lib/plan';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Voria PRO · Voria' };

export default async function ProEinstellungen() {
  const supabase = await createServerClient();
  const [{ t }, { data: user }, hatPro] = await Promise.all([
    texte(),
    supabase.auth.getUser(),
    istPro(),
  ]);

  const { data: profil } = user.user
    ? await supabase
        .from('profiles')
        .select('pro_design, pro_material, pro_bewegung')
        .eq('id', user.user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="seite">
      <Link href="/du/einstellungen" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.einstellungen.titel}
      </Link>
      <h1 className="gross">{t.pro.titel}</h1>

      {/*
        Ohne PRO steht hier trotzdem die Vorschau — man soll sehen,
        was man bekäme, und nicht nur lesen. Der Weg zur Preisseite
        steht darüber, damit er nicht erst nach dem Ausprobieren
        auftaucht.
      */}
      {!hatPro && (
        <div className="pro-hinweis">
          <p>{t.pro.nochNicht}</p>
          <Link href="/pro" className="konto-weg">
            {t.pro.wasKostet}
          </Link>
        </div>
      )}

      <ProWahl
        stand={{
          pro_design: profil?.pro_design ?? null,
          pro_material: profil?.pro_material ?? true,
          pro_bewegung: profil?.pro_bewegung ?? false,
        }}
      />
    </div>
  );
}
