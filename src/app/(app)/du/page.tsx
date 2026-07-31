import Link from 'next/link';
import { Settings, Sparkles, Pencil, Gem } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import { istPro } from '@/lib/plan';
import { Seitenkopf } from '@/ui/Bausteine';
import { Avatar } from '@/ui/Avatar';
import { abmelden } from '@/features/auth/actions';
import { texte } from '@/i18n/server';

export const metadata = { title: 'Du · Voria' };

export default async function DuSeite() {
  const supabase = await createServerClient();
  const [{ t }, hatPro] = await Promise.all([texte(), istPro()]);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profil } = user
    ? await supabase.from('profiles').select('username, display_name, bio, avatar_url').eq('id', user.id).maybeSingle()
    : { data: null };

  const [{ count: reisen }, { count: folgen }, { count: folgend }] = await Promise.all([
    // .eq() nötig: trips_read lässt fremde öffentliche Reisen durch,
    // sonst stünde bei „Reisen" die Summe aller Nutzer.
    supabase.from('trips').select('id', { count: 'exact', head: true }).eq('user_id', user?.id ?? ''),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followee_id', user?.id ?? ''),
    supabase.from('follows').select('followee_id', { count: 'exact', head: true }).eq('follower_id', user?.id ?? ''),
  ]);

  return (
    <div className="seite">
      <div className="profil-kopf">
        <Avatar
          bild={profil?.avatar_url ?? null}
          name={profil?.display_name || profil?.username || '?'}
          groesse={64}
        />
        {profil?.username && <span className="profil-name">@{profil.username}</span>}
      </div>

      <Seitenkopf
        titel={profil?.display_name || profil?.username || t.profil.du}
        zeile={profil?.bio || undefined}
        aktion={
          <span className="kopf-aktionen">
            <Link href="/du/bearbeiten" className="anlegen">
              <Pencil size={15} strokeWidth={1.75} aria-hidden /> {t.profil.bearbeiten}
            </Link>
            <Link href="/du/einstellungen" className="rund" aria-label={t.nav.einstellungen}>
              <Settings size={17} strokeWidth={1.75} aria-hidden />
            </Link>
          </span>
        }
      />

      <dl className="zahlen">
        <div><dt>{t.profil.reisen}</dt><dd>{reisen ?? 0}</dd></div>
        <div><dt>{t.profil.folgenDir}</dt><dd>{folgen ?? 0}</dd></div>
        <div><dt>{t.profil.duFolgst}</dt><dd>{folgend ?? 0}</dd></div>
      </dl>

      <Link href="/rueckblick" className="rueckblick-band">
        <Sparkles size={20} strokeWidth={1.5} aria-hidden />
        <span>
          <strong>{t.rueckblick.titel}</strong>
          {t.rueckblick.zeile}
        </span>
      </Link>

      {/*
        „PRO werden" steht dauerhaft im Profil — so entschieden am
        30.07. Aber nur, solange man es nicht hat: Wer bezahlt, soll
        nicht bei jedem Blick aufs eigene Profil daran erinnert
        werden, dass er bezahlt.

        Kein Zeitgeber, kein Pop-up. Es steht da und wartet.
      */}
      {!hatPro && (
        <Link href="/pro" className="rueckblick-band">
          <Gem size={20} strokeWidth={1.5} aria-hidden />
          <span>
            <strong>{t.pro.einstieg}</strong>
            {t.pro.einstiegZeile}
          </span>
        </Link>
      )}

      {/* Unauffällig, neben dem Abmelden — eine Rückmeldung ist kein
          Hauptweg durch die App, aber sie soll jeder finden, ohne
          danach suchen zu müssen. */}
      <Link href="/rueckmeldung" className="fusszeile-link">
        {t.rueckmeldung.titel}
      </Link>

      <form action={abmelden} className="abmelden">
        <button type="submit">{t.auth.abmelden}</button>
      </form>
    </div>
  );
}
