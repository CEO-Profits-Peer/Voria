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
