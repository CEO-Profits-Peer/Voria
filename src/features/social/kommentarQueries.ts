/**
 * Kommentare eines Beitrags lesen.
 *
 * Ein Beitrag hat wenige Kommentare, deshalb kommen sie in EINER
 * Abfrage und werden im Speicher zum Baum gefaltet. Eine rekursive
 * Abfrage je Ebene wäre bei drei Ebenen schon dreimal so teuer, ohne
 * dass jemand etwas davon hätte.
 */

import { createServerClient } from '@/lib/supabase-server';

export interface Kommentar {
  id: string;
  text: string;
  votes: number;
  selbstGevotet: boolean;
  /** Nur der Verfasser darf bearbeiten — entschieden wird das in der Datenbank. */
  vonMir: boolean;
  bearbeitet: boolean;
  wann: string;
  verfasser: { name: string; benutzername: string; bild: string | null };
  antworten: Kommentar[];
}

/*
 * DER FREMDSCHLÜSSEL MUSS HIER STEHEN.
 *
 * `comment_votes` erzeugt zwischen `comments` und `profiles` genau die
 * Konstellation, die am 29.07. den Feed lahmgelegt hat: ein direkter
 * Weg über `comments.user_id` und ein zweiter als many-to-many über
 * `comment_votes`. PostgREST kann dann nicht wählen und antwortet mit
 * HTTP 300 / PGRST201 — ohne Eintrag in Konsole oder Terminal.
 */
const AUSWAHL = `id, parent_id, text, vote_count, edited_at, created_at, user_id,
  profiles!comments_user_id_fkey(username, display_name, avatar_url)`;

export async function ladeKommentare(beitragId: string): Promise<Kommentar[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('comments')
    .select(AUSWAHL)
    .eq('post_id', beitragId)
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: true });

  // Niemals `if (!data) return []` allein — genau so verschwand der Feed.
  if (error) {
    console.error('[ladeKommentare] Kommentare konnten nicht geladen werden:', error);
    return [];
  }
  if (!data || data.length === 0) return [];

  let eigene = new Set<string>();
  if (user) {
    const { data: v } = await supabase
      .from('comment_votes')
      .select('comment_id')
      .eq('user_id', user.id)
      .in(
        'comment_id',
        data.map((k) => k.id),
      );
    eigene = new Set((v ?? []).map((x) => x.comment_id));
  }

  return falten(data, eigene, user?.id);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Flache Liste zu Baum. Die Reihenfolge aus der Abfrage bleibt auf
 * jeder Ebene erhalten — die Datenbank hat schon nach Stimmen und
 * danach nach Alter sortiert, hier wird nichts noch einmal sortiert.
 */
function falten(roh: any[], gevotet: Set<string>, nutzerId: string | undefined): Kommentar[] {
  const knoten = new Map<string, Kommentar>();

  for (const k of roh) {
    knoten.set(k.id, {
      id: k.id,
      text: k.text,
      votes: k.vote_count ?? 0,
      selbstGevotet: gevotet.has(k.id),
      vonMir: !!nutzerId && k.user_id === nutzerId,
      bearbeitet: !!k.edited_at,
      wann: k.created_at,
      verfasser: {
        name: k.profiles?.display_name || k.profiles?.username || 'Jemand',
        benutzername: k.profiles?.username ?? '',
        bild: k.profiles?.avatar_url ?? null,
      },
      antworten: [],
    });
  }

  const wurzeln: Kommentar[] = [];
  for (const k of roh) {
    const dieser = knoten.get(k.id)!;
    const eltern = k.parent_id ? knoten.get(k.parent_id) : undefined;
    /*
     * Fällt der Elternteil weg, hängt die Antwort an der Wurzel statt
     * zu verschwinden. Passieren kann das heute nicht — die Kaskade
     * räumt Kinder mit ab —, aber ein stiller Verlust wäre der
     * schlimmere Ausgang.
     */
    if (eltern) eltern.antworten.push(dieser);
    else wurzeln.push(dieser);
  }

  return wurzeln;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
