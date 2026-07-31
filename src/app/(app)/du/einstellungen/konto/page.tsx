import Link from 'next/link';
import { ChevronLeft, Download, MessageSquare } from 'lucide-react';
import { KontoLoeschen } from '@/features/profile/KontoLoeschen';
import { createServerClient } from '@/lib/supabase-server';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Konto · Voria' };

export default async function KontoSeite() {
  const supabase = await createServerClient();
  const [{ t }, { data: user }] = await Promise.all([texte(), supabase.auth.getUser()]);

  const { data: profil } = user.user
    ? await supabase.from('profiles').select('username').eq('id', user.user.id).maybeSingle()
    : { data: null };

  return (
    <div className="seite">
      <Link href="/du/einstellungen" className="zurueck-zeile">
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden /> {t.einstellungen.titel}
      </Link>
      <h1 className="gross">{t.konto.titel}</h1>

      <div className="abschnitte">
        {/* Der Export steht VOR dem Löschen, und zwar mit Absicht: Wer
            hier landet, um zu gehen, soll den Weg zu seinen Daten
            finden, bevor er den Löschknopf findet. */}
        <section>
          <h2>{t.export.titel}</h2>
          <p className="unterseite-zeile">{t.export.warum}</p>
          <Link href="/du/export" className="konto-weg">
            <Download size={16} strokeWidth={1.75} aria-hidden />
            {t.export.verweis}
          </Link>
        </section>

        <section>
          <h2>{t.rueckmeldung.titel}</h2>
          <p className="unterseite-zeile">{t.rueckmeldung.zeile}</p>
          <Link href="/rueckmeldung" className="konto-weg">
            <MessageSquare size={16} strokeWidth={1.75} aria-hidden />
            {t.rueckmeldung.titel}
          </Link>
        </section>

        {/* Ohne Alarmfarbe. Löschen ist ein legitimer Vorgang, kein
            Unfall, den es zu verhindern gilt. */}
        <section>
          <h2>{t.konto.loeschen}</h2>
          <KontoLoeschen benutzername={profil?.username ?? ''} />
        </section>
      </div>
    </div>
  );
}
