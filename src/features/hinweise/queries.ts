/**
 * Hinweise lesen.
 *
 * Row Level Security entscheidet, wessen Hinweise zurückkommen —
 * `notifications_read` lässt nur `user_id = auth.uid()` durch. Der
 * zusätzliche Filter im Code steht trotzdem da, aus demselben Grund
 * wie bei `ladeReisen`: Was auf DIESER Seite stehen soll, ist eine
 * Frage der Abfrage, nicht der Zugriffsregel.
 */

import { createServerClient } from '@/lib/supabase-server';

export type HinweisArt = 'kommentar' | 'antwort' | 'folger' | 'upload';

export interface Hinweis {
  id: string;
  art: HinweisArt;
  gelesen: boolean;
  wann: string;
  wer: { name: string; benutzername: string; bild: string | null };
  /** Wohin der Hinweis führt. Null, wenn das Ziel gelöscht wurde. */
  ziel: string | null;
}

/*
 * DER FREMDSCHLÜSSEL MUSS HIER STEHEN.
 *
 * `notifications` zeigt zweimal auf `profiles`: über `user_id` (der
 * Empfänger) und über `actor_id` (der Auslöser). PostgREST kann dann
 * nicht wählen und antwortet mit HTTP 300 / PGRST201 — lautlos, wie
 * schon beim Feed am 29.07.
 *
 * Gebraucht wird der Auslöser: „wer hat das gemacht".
 */
const AUSWAHL = `id, art, read_at, created_at, post_id,
  profiles!notifications_actor_id_fkey(username, display_name, avatar_url)`;

export async function ladeHinweise(): Promise<Hinweis[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select(AUSWAHL)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[ladeHinweise]', error);
    return [];
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data as any[]).map((h) => ({
    id: h.id,
    art: h.art,
    gelesen: !!h.read_at,
    wann: h.created_at,
    wer: {
      name: h.profiles?.display_name || h.profiles?.username || 'Jemand',
      benutzername: h.profiles?.username ?? '',
      bild: h.profiles?.avatar_url ?? null,
    },
    /*
     * „folger" führt aufs Profil, alles andere zum Beitrag. Fehlt der
     * Beitrag — gelöscht, während der Hinweis noch stand —, bleibt das
     * Ziel leer und die Zeile wird als Text gezeigt statt als toter
     * Verweis.
     */
    ziel:
      h.art === 'folger'
        ? h.profiles?.username
          ? `/u/${h.profiles.username}`
          : null
        : h.post_id
          ? `/feed/${h.post_id}`
          : null,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/**
 * Die Zahl für den Punkt an der Glocke.
 *
 * `head: true` holt nur die Anzahl, keine Zeilen — das läuft bei jedem
 * Seitenaufruf in der Hülle mit und darf nichts kosten.
 */
export async function ungeleseneHinweise(): Promise<number> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    console.error('[ungeleseneHinweise]', error);
    return 0;
  }
  return count ?? 0;
}
