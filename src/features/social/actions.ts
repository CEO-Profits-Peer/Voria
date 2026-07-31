'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';
import { ladeFeed, type Beitrag } from './queries';
import { SEITE, type Reiter } from './konstanten';

/**
 * Den nächsten Stapel holen.
 *
 * Der Reiter muss mitgereicht werden: sonst lädt „Folge ich" ab der
 * zehnten Karte den offenen Feed nach, und plötzlich stehen Fremde in
 * einer Liste, die ausdrücklich nur Gefolgte zeigen sollte.
 */
export async function mehrBeitraege(versatz: number, reiter: Reiter): Promise<Beitrag[]> {
  return ladeFeed(versatz, SEITE, reiter);
}

/**
 * Beiträge als gelesen vermerken.
 *
 * Gesammelt geschickt, nicht je Karte: Beim Scrollen kämen sonst
 * zwanzig Anfragen in zehn Sekunden.
 *
 * `upsert` mit `ignoreDuplicates`, weil derselbe Beitrag zwangsläufig
 * mehrfach gemeldet wird — beim zweiten Öffnen, beim Zurückscrollen.
 * Ein Fehler daraus wäre lästig und bedeutungslos.
 *
 * KEIN `revalidatePath`. Der Vermerk soll die Reihenfolge NICHT sofort
 * ändern — sonst rutschen die Karten unter dem Finger weg, während man
 * sie liest. Er wirkt beim nächsten Öffnen, und genau das ist der Sinn.
 */
export async function alsGelesenMerken(beitragIds: string[]) {
  if (beitragIds.length === 0) return;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('post_views')
    .upsert(
      beitragIds.map((post_id) => ({ user_id: user.id, post_id })),
      { onConflict: 'user_id,post_id', ignoreDuplicates: true },
    );

  if (error) console.error('[alsGelesenMerken]', error);
}

/** Upvote setzen oder zurücknehmen. Der Zähler läuft per Trigger mit. */
export async function voten(beitragId: string, gesetzt: boolean) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (gesetzt) {
    await supabase.from('votes').delete().eq('post_id', beitragId).eq('user_id', user.id);
  } else {
    await supabase.from('votes').insert({ post_id: beitragId, user_id: user.id });
  }

  revalidatePath('/feed');
}

export async function folgen(profilId: string, folgtBereits: boolean) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === profilId) return;

  if (folgtBereits) {
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('followee_id', profilId);
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, followee_id: profilId });
  }

  revalidatePath('/du');
  revalidatePath('/feed');
}
