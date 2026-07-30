import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Einstellungen } from '@/features/profile/Einstellungen';
import type { SchalterStand } from '@/features/hinweise/HinweisSchalter';
import { createServerClient } from '@/lib/supabase-server';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Einstellungen · Voria' };

/** Voreinstellung wie in `0008_hinweise.sql`: alles an, still aus. */
const STANDARD: SchalterStand = {
  hinweis_kommentar: true,
  hinweis_folger: true,
  hinweis_upload: true,
  stiller_modus: false,
};

export default async function EinstellungenSeite() {
  const supabase = await createServerClient();
  const [{ t }, { data: user }] = await Promise.all([texte(), supabase.auth.getUser()]);

  const { data: profil, error } = user.user
    ? await supabase
        .from('profiles')
        .select('hinweis_kommentar, hinweis_folger, hinweis_upload, stiller_modus')
        .eq('id', user.user.id)
        .maybeSingle()
    : { data: null, error: null };

  // Ohne diese Zeile sähe eine fehlende Migration wie „alles an" aus.
  if (error) console.error('[EinstellungenSeite] Schalter nicht geladen:', error);

  return (
    <div className="seite">
      <Link href="/du" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.profil.du}
      </Link>
      <h1 className="gross">{t.einstellungen.titel}</h1>
      <Einstellungen hinweise={profil ?? STANDARD} />
    </div>
  );
}
