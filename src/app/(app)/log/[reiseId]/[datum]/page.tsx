import { notFound, redirect } from 'next/navigation';
import { ladeReise, ladeTag } from '@/features/log/queries';
import { tagSichern } from '@/features/log/actions';
import { Tagesansicht } from '@/features/log/Tagesansicht';
import { createServerClient } from '@/lib/supabase-server';

export default async function TagSeite({
  params,
}: {
  params: Promise<{ reiseId: string; datum: string }>;
}) {
  const { reiseId, datum } = await params;

  const reise = await ladeReise(reiseId);
  if (!reise) notFound();

  /* Nur für die Vorschau im Teilen-Dialog: Sie zeigt die Karte so,
     wie Fremde sie später sehen — dazu gehört der eigene Name. */
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profil } = user
    ? await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null };

  let tag = await ladeTag(reiseId, datum);

  // Den Tag gibt es noch nicht — er entsteht beim ersten Öffnen.
  if (!tag) {
    const id = await tagSichern(reiseId, datum);
    if (!id) redirect(`/log/${reiseId}`);
    tag = await ladeTag(reiseId, datum);
    if (!tag) redirect(`/log/${reiseId}`);
  }

  return (
    <Tagesansicht
      tag={tag}
      reiseId={reiseId}
      region={reise.region}
      istErsterTag={reise.tage.length <= 1}
      verfasser={profil?.display_name || profil?.username || ''}
    />
  );
}
