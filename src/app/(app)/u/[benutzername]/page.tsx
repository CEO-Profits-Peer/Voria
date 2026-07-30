import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { Seitenkopf } from '@/ui/Bausteine';
import { Avatar } from '@/ui/Avatar';
import { BeitragKarte } from '@/features/social/BeitragKarte';
import { FolgenKnopf } from '@/features/profile/FolgenKnopf';
import { ladeProfilBeitraege } from '@/features/social/profilQueries';

export default async function FremdesProfil({
  params,
}: {
  params: Promise<{ benutzername: string }>;
}) {
  const { benutzername } = await params;
  const supabase = await createServerClient();

  const { data: profil } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .eq('username', benutzername.toLowerCase())
    .maybeSingle();

  if (!profil) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const eigenes = user?.id === profil.id;

  const [{ count: folgen }, { count: folgend }, { data: folgeIch }] = await Promise.all([
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('followee_id', profil.id),
    supabase.from('follows').select('followee_id', { count: 'exact', head: true }).eq('follower_id', profil.id),
    user
      ? supabase.from('follows').select('followee_id').eq('follower_id', user.id).eq('followee_id', profil.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const beitraege = await ladeProfilBeitraege(profil.id);

  return (
    <div className="seite">
      <div className="profil-kopf">
        <Avatar bild={profil.avatar_url} name={profil.display_name || profil.username} groesse={64} />
        <span className="profil-name">@{profil.username}</span>
      </div>

      <Seitenkopf
        titel={profil.display_name || profil.username}
        zeile={profil.bio || undefined}
        aktion={eigenes ? undefined : <FolgenKnopf profilId={profil.id} folgtBereits={Boolean(folgeIch)} />}
      />

      <dl className="zahlen">
        <div><dt>Geteilt</dt><dd>{beitraege.length}</dd></div>
        <div><dt>Folgen</dt><dd>{folgen ?? 0}</dd></div>
        <div><dt>Folgt</dt><dd>{folgend ?? 0}</dd></div>
      </dl>

      {beitraege.length === 0 ? (
        <p className="still">Hier wurde noch nichts geteilt.</p>
      ) : (
        <div className="strom">
          {beitraege.map((b) => <BeitragKarte key={b.id} beitrag={b} />)}
        </div>
      )}
    </div>
  );
}
