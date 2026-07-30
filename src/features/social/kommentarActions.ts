'use server';

/**
 * Kommentare schreiben, bearbeiten, mitstimmen.
 *
 * Löschen gibt es nicht — weder hier noch in der Datenbank. Das ist
 * die Entscheidung vom 30.07., nicht eine Lücke in der Oberfläche.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';
import { ladeKommentare, type Kommentar } from './kommentarQueries';

const HOECHSTLAENGE = 2000;

/** Der Bereich lädt erst beim Aufklappen — nicht 50 Beiträge im Voraus. */
export async function holeKommentare(beitragId: string): Promise<Kommentar[]> {
  return ladeKommentare(beitragId);
}

export async function kommentieren(
  beitragId: string,
  text: string,
  elternId: string | null,
): Promise<Kommentar[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const sauber = text.trim().slice(0, HOECHSTLAENGE);
  if (!sauber) return ladeKommentare(beitragId);

  const { error } = await supabase.from('comments').insert({
    post_id: beitragId,
    user_id: user.id,
    parent_id: elternId,
    text: sauber,
  });

  if (error) console.error('[kommentieren]', error);

  revalidatePath('/feed');
  revalidatePath(`/feed/${beitragId}`);

  /* Die frische Liste zurückgeben: der Bereich ist aufgeklappt und
     bekommt vom revalidatePath des Feeds nichts mit. */
  return ladeKommentare(beitragId);
}

export async function kommentarAendern(
  beitragId: string,
  kommentarId: string,
  text: string,
): Promise<Kommentar[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const sauber = text.trim().slice(0, HOECHSTLAENGE);
  if (!sauber) return ladeKommentare(beitragId);

  /*
   * `.eq('user_id', …)` obwohl `comments_update` dasselbe verlangt.
   * Zwei Gründe: ein Treffer auf einen fremden Kommentar liefert
   * sonst schweigend null Zeilen statt eines Fehlers, und die Absicht
   * steht damit im Code, nicht nur in der Migration.
   *
   * `edited_at` wird NICHT mitgeschickt — das setzt der Trigger.
   * Der Client hat auf die Spalte auch gar kein Schreibrecht.
   */
  const { error } = await supabase
    .from('comments')
    .update({ text: sauber })
    .eq('id', kommentarId)
    .eq('user_id', user.id);

  if (error) console.error('[kommentarAendern]', error);

  revalidatePath('/feed');
  revalidatePath(`/feed/${beitragId}`);

  return ladeKommentare(beitragId);
}

/** Der Zähler läuft per Trigger mit, hier wird nur die Stimme gesetzt. */
export async function kommentarVoten(kommentarId: string, gesetzt: boolean) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = gesetzt
    ? await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', kommentarId)
        .eq('user_id', user.id)
    : await supabase.from('comment_votes').insert({ comment_id: kommentarId, user_id: user.id });

  if (error) console.error('[kommentarVoten]', error);
}
