import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { HinweisSchalter, type SchalterStand } from '@/features/hinweise/HinweisSchalter';
import { StartWahl } from '@/features/hinweise/StartWahl';
import { createServerClient } from '@/lib/supabase-server';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Hinweise · Voria' };

/** Voreinstellung wie in `0008_hinweise.sql` und `0009`. */
const STANDARD: SchalterStand = {
  hinweis_kommentar: true,
  hinweis_folger: true,
  hinweis_upload: true,
  stiller_modus: false,
  startbereich: 'feed',
};

export default async function HinweiseEinstellungen() {
  const supabase = await createServerClient();
  const [{ t }, { data: user }] = await Promise.all([texte(), supabase.auth.getUser()]);

  const { data: profil, error } = user.user
    ? await supabase
        // prettier-ignore
        .from('profiles')
        .select('hinweis_kommentar, hinweis_folger, hinweis_upload, stiller_modus, startbereich')
        .eq('id', user.user.id)
        .maybeSingle()
    : { data: null, error: null };

  // Ohne diese Zeile sähe eine fehlende Migration wie „alles an" aus.
  if (error) console.error('[HinweiseEinstellungen]', error);

  const stand = profil ?? STANDARD;

  return (
    <div className="seite">
      <Link href="/du/einstellungen" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.einstellungen.titel}
      </Link>
      <h1 className="gross">{t.einstellungen.katHinweise}</h1>

      <div className="abschnitte">
        <section>
          <h2>{t.hinweise.titel}</h2>
          <HinweisSchalter stand={stand} />
        </section>

        <section>
          <h2>{t.startbereich.titel}</h2>
          <StartWahl wert={stand.startbereich} still={stand.stiller_modus} />
        </section>
      </div>
    </div>
  );
}
