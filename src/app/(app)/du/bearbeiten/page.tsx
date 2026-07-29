import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import { ProfilFormular } from '@/features/profile/ProfilFormular';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Profil bearbeiten · Voria' };

export default async function ProfilBearbeitenSeite() {
  const supabase = await createServerClient();
  const { t } = await texte();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/anmelden');

  const { data: profil } = await supabase
    .from('profiles')
    .select('username, display_name, bio, is_private')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="seite">
      <Link href="/du" className="zurueck-zeile">
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden /> {t.profil.du}
      </Link>
      <h1 className="gross">{t.profil.bearbeiten}</h1>
      <ProfilFormular
        benutzername={profil?.username ?? ''}
        anzeigename={profil?.display_name ?? ''}
        beschreibung={profil?.bio ?? ''}
        privat={profil?.is_private ?? false}
      />
    </div>
  );
}
